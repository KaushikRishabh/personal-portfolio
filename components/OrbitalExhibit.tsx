"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  FIXED_DT, MAX_PROBES, MAX_SPEED, STAR_RADIUS, clampGravity,
  createProbe, createSimulationState, estimateThrowVelocity, stepPhysics,
  type CollisionEvent, type MotionSample, type PhysicsProbe, type Point,
} from "@/lib/orbital-physics";

type Probe = PhysicsProbe & { color: string; trail: Point[] };
type Spark = Point & { vx: number; vy: number; life: number; duration: number; color: string; size: number };
type Ring = Point & { life: number; duration: number; star: boolean };
type Gesture = {
  pointerId: number; startClient: Point; position: Point; samples: MotionSample[]; dragged: boolean;
};
const W = 760;
const H = 490;
const CENTER = { x: 423, y: 225 };
const STEP = FIXED_DT;
const COLORS = ["#8ebcd2", "#b4c7a2", "#eeaa75", "#dfb8d0", "#e9d9a8"];

function initialProbes(): Probe[] {
  return createSimulationState().probes.map((body) => {
    const probe: Probe = { ...body, color: COLORS[body.id % COLORS.length], trail: [] };
    // A short reversed-velocity prehistory makes the first frame feel alive.
    const previous = createProbe(body.id, body, { x: -body.vx, y: -body.vy });
    for (let sample = 0; sample < 150; sample++) {
      stepPhysics([previous], 1 / 24, 1);
      probe.trail.unshift({ x: previous.x, y: previous.y });
    }
    return probe;
  });
}

function Icon({ kind }: { kind: "pause" | "play" | "reset" | "kick" | "add" }) {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {kind === "pause" && <path d="M4 3v10M11 3v10" stroke="currentColor" strokeWidth="3" />}
      {kind === "play" && <path d="m4 2 9 6-9 6V2Z" fill="currentColor" />}
      {kind === "reset" && <><path d="M3 5a5.5 5.5 0 1 1-1 5" stroke="currentColor" strokeWidth="1.5" /><path d="M3 1v4h4" stroke="currentColor" strokeWidth="1.5" /></>}
      {kind === "kick" && <path d="m9 1-6 8h5l-1 6 6-9H8l1-5Z" fill="currentColor" />}
      {kind === "add" && <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" />}
    </svg>
  );
}

export default function OrbitalExhibit() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [initial] = useState(initialProbes);
  const probesRef = useRef<Probe[]>(initial);
  const sparksRef = useRef<Spark[]>([]);
  const ringsRef = useRef<Ring[]>([]);
  const gestureRef = useRef<Gesture | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emitEventsRef = useRef<(events: CollisionEvent[]) => void>(() => {});
  const countersRef = useRef({ bounces: 0, absorbed: 0 });
  const [telemetry, setTelemetry] = useState({ active: 3, bounces: 0, absorbed: 0 });
  const [throwSpeed, setThrowSpeed] = useState(140);
  const [throwDirection, setThrowDirection] = useState("up");
  const pausedRef = useRef(true);
  const gravityRef = useRef(1);
  const drawRef = useRef<() => void>(() => {});
  const resumeRef = useRef<() => void>(() => {});
  const resetRuntimeRef = useRef<() => void>(() => {});
  const nextId = useRef(3);
  const [paused, setPaused] = useState(true);
  const [gravity, setGravity] = useState(1);
  const [message, setMessage] = useState("Click to drop. Drag and release to throw. Faster flicks fly faster.");
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    pausedRef.current = media.matches;
    setPaused(media.matches);
    const onChange = () => {
      if (media.matches) {
        pausedRef.current = true;
        setPaused(true);
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const togglePause = useCallback(() => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    if (!pausedRef.current) resumeRef.current();
  }, []);

  const reset = useCallback(() => {
    probesRef.current = initialProbes();
    nextId.current = 3;
    gravityRef.current = createSimulationState().gravity;
    sparksRef.current = [];
    ringsRef.current = [];
    gestureRef.current = null;
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    countersRef.current = { bounces: 0, absorbed: 0 };
    setTelemetry({ active: 3, bounces: 0, absorbed: 0 });
    setGravity(1);
    resetRuntimeRef.current();
    setMessage("Reset: three starter probes, gravity 1.0×, and collision counters cleared.");
    drawRef.current();
  }, []);

  const launch = useCallback((position: Point, velocity: Point, dropped = false) => {
    const body = createProbe(nextId.current++, position, velocity);
    const probe: Probe = { ...body, color: COLORS[body.id % COLORS.length], trail: [] };
    const active = probesRef.current.filter((p) => p.alive);
    const retired = active.length >= MAX_PROBES;
    if (retired) active.shift();
    probesRef.current = [...active, probe];
    const speed = Math.round(Math.hypot(probe.vx, probe.vy));
    if (Math.hypot(probe.x, probe.y) <= STAR_RADIUS + probe.radius) {
      probe.alive = false;
      emitEventsRef.current([{ type: "star", x: probe.x, y: probe.y, probeIds: [probe.id], speed }]);
      setMessage("Probe absorbed by Sol on contact. Try releasing farther from the star.");
    } else {
      setMessage(`${dropped || speed === 0 ? "Dropped" : "Thrown"} probe ${String(probe.id + 1).padStart(2, "0")} at ${speed} u/s.${pausedRef.current ? " Press Play to simulate." : ""}${retired ? " Oldest probe retired (16-probe limit)." : ""}`);
    }
    setTelemetry({ active: probesRef.current.filter((p) => p.alive).length, ...countersRef.current });
    drawRef.current();
  }, []);

  const keyboardLaunch = useCallback((drop: boolean) => {
    const position = { x: -185, y: -20 };
    const directions: Record<string, Point> = { up: { x: 0, y: -1 }, right: { x: 1, y: 0 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 } };
    const direction = directions[throwDirection];
    launch(position, drop ? { x: 0, y: 0 } : { x: direction.x * throwSpeed, y: direction.y * throwSpeed }, drop);
  }, [launch, throwDirection, throwSpeed]);

  const pointerPoint = (event: { clientX: number; clientY: number }, canvas: HTMLCanvasElement): Point => {
    const bounds = canvas.getBoundingClientRect();
    return { x: (event.clientX - bounds.left) / bounds.width * W - CENTER.x, y: (event.clientY - bounds.top) / bounds.height * H - CENTER.y };
  };

  const addPointerSample = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const samples = typeof event.nativeEvent.getCoalescedEvents === "function" ? event.nativeEvent.getCoalescedEvents() : [];
    for (const sample of samples) {
      const point = pointerPoint(sample, event.currentTarget);
      gesture.samples.push({ ...point, time: sample.timeStamp });
    }
    const position = pointerPoint(event, event.currentTarget);
    gesture.position = position;
    gesture.samples.push({ ...position, time: event.timeStamp });
    if (Math.hypot(event.clientX - gesture.startClient.x, event.clientY - gesture.startClient.y) > 5) gesture.dragged = true;
    // Keep a little more than the velocity window; include one older anchor sample.
    while (gesture.samples.length > 2 && gesture.samples[1].time < event.timeStamp - 180) gesture.samples.shift();
    if (gesture.samples.length > 100) gesture.samples.splice(0, gesture.samples.length - 100);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = sceneRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let frame = 0;
    let last = 0;
    let accumulator = 0;
    let simTime = 0;
    let trailClock = 0;
    let telemetryClock = 0;
    const contactCooldown = new Map<string, number>();
    let visible = true;
    let destroyed = false;
    let logicalScale = 1;
    let seed = 719;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const stars = Array.from({ length: 103 }, () => ({ x: random() * W, y: random() * 416 + 25, size: random() > 0.93 ? 2.5 : 1.2, alpha: random() * 0.43 + 0.12 }));

    emitEventsRef.current = (events) => {
      for (const event of events) {
        if (event.type === "escape") continue;
        const key = event.type + event.probeIds.join(":");
        if ((contactCooldown.get(key) ?? -Infinity) > simTime - 0.12) continue;
        contactCooldown.set(key, simTime);
        if (contactCooldown.size > 128) contactCooldown.delete(contactCooldown.keys().next().value as string);
        const star = event.type === "star";
        if (star) countersRef.current.absorbed++;
        else countersRef.current.bounces++;
        const count = star ? 18 : 8;
        const duration = star ? 0.7 : 0.4;
        ringsRef.current.push({ x: event.x, y: event.y, life: duration, duration, star });
        if (ringsRef.current.length > 10) ringsRef.current.shift();
        for (let i = 0; i < count; i++) {
          const angle = Math.PI * 2 * (i / count) + random() * 0.25;
          const speed = (star ? 34 : 20) + random() * (star ? 70 : 45);
          sparksRef.current.push({ x: event.x, y: event.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: duration, duration, color: star ? i % 3 ? "#f1b669" : "#fff0c3" : i % 2 ? "#bce0d6" : "#e9c5a0", size: star ? 3 : 2 });
        }
        if (sparksRef.current.length > 140) sparksRef.current.splice(0, sparksRef.current.length - 140);
      }
    };

    const rect = (x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(
        Math.round(x * logicalScale) / logicalScale,
        Math.round(y * logicalScale) / logicalScale,
        Math.max(1, Math.round(w * logicalScale)) / logicalScale,
        Math.max(1, Math.round(h * logicalScale)) / logicalScale,
      );
    };
    const pixelLine = (x: number, y: number, x2: number, y2: number, color: string, pixel = 2) => {
      const distance = Math.hypot(x2 - x, y2 - y);
      for (let step = 0; step <= distance; step += pixel) {
        const ratio = distance ? step / distance : 0;
        rect(x + (x2 - x) * ratio, y + (y2 - y) * ratio, pixel, pixel, color);
      }
    };
    const sprite = (rows: string[], x: number, y: number, size: number, palette: Record<string, string>) => {
      rows.forEach((row, rowIndex) => row.split("").forEach((cell, column) => {
        if (palette[cell]) rect(x + column * size, y + rowIndex * size, size, size, palette[cell]);
      }));
    };

    const draw = () => {
      ctx.setTransform(logicalScale, 0, 0, logicalScale, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, W, H);
      rect(0, 0, W, H, "#101e2b");
      // Quiet navigation grid, deliberately subordinate to the celestial scene.
      ctx.strokeStyle = "rgba(119, 153, 174, .065)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 23; x < W; x += 42) { ctx.moveTo(x, 0); ctx.lineTo(x, 442); }
      for (let y = 19; y < 445; y += 42) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();
      stars.forEach((star) => {
        ctx.globalAlpha = star.alpha;
        rect(star.x, star.y, star.size, star.size, "#dfdfca");
        if (star.size > 2) {
          rect(star.x - 3, star.y + 1, 9, 1, "#c2d0cc");
          rect(star.x + 1, star.y - 3, 1, 9, "#c2d0cc");
        }
      });
      ctx.globalAlpha = 1;

      [90, 153, 199].forEach((radius) => {
        ctx.beginPath();
        ctx.setLineDash([2, 7]);
        ctx.strokeStyle = "rgba(156, 183, 194, .17)";
        ctx.lineWidth = 1;
        ctx.arc(CENTER.x, CENTER.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      // Registration marks give the scene the feel of an old observatory display.
      for (const angle of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
        const x = CENTER.x + Math.cos(angle) * 214;
        const y = CENTER.y + Math.sin(angle) * 214;
        pixelLine(x - 3, y, x + 3, y, "#536573", 1);
        pixelLine(x, y - 3, x, y + 3, "#536573", 1);
      }

      // The sun is raster-built: stepped silhouettes, bright core, pixel corona.
      const pulse = Math.floor(simTime * 2) % 2;
      for (let row = -14; row <= 14; row++) {
        for (let col = -14; col <= 14; col++) {
          const radius = Math.hypot(row, col);
          if (radius < 14) {
            let color = "";
            if (radius < 6.4) color = col + row < -2 ? "#ffe3a0" : "#f3bb63";
            else if (radius < 7.8) color = "#dc9550";
            else if (radius < 9.4) color = "rgba(233, 158, 75, .13)";
            else if (radius < 11.5 + pulse * 0.3) color = "rgba(233, 158, 75, .055)";
            if (color) rect(CENTER.x + col * 3 - 1, CENTER.y + row * 3 - 1, 3, 3, color);
          }
        }
      }
      rect(CENTER.x - 12, CENTER.y - 13, 8, 4, "#ffeac1");
      rect(CENTER.x - 15, CENTER.y - 9, 4, 7, "#ffeac1");
      rect(CENTER.x + 8, CENTER.y + 10, 7, 3, "#e3a052");

      // Faraway ridge and a ground station, framing rather than obscuring the orbits.
      const ridge = [454, 454, 447, 447, 440, 440, 445, 445, 452, 452, 445, 445, 451, 451, 442, 442, 448, 448, 454, 454, 440, 440, 434, 434, 443, 443, 436, 436, 447, 447, 452, 452];
      ridge.forEach((height, i) => rect(i * 25, height, 25, H - height, "#1b2d39"));
      rect(0, 464, W, 26, "#203440");
      rect(0, 463, W, 2, "#40515a");
      for (let i = 0; i < 21; i++) {
        const x = (i * 119 + 15) % W;
        rect(x, 471 + (i % 3) * 5, i % 2 ? 9 : 4, 2, "#354b55");
      }
      rect(35, 457, 158, 6, "#51646b");
      rect(42, 463, 8, 12, "#3d515c");
      rect(178, 463, 8, 12, "#3d515c");
      // Mission specialist: 13 x 20 sprite, with visor, backpack and little boots.
      sprite([
        "....HHHHH....", "...HWWWWWH...", "..HWWWWWWWH..", "..HWDVVVVWH..", "..HWVVVVVWH..",
        ".BHWWVVVVWH..", ".BBHWWWWWH...", ".BB.WWHWW....", ".BBWWWWWWWW..", ".BBWWAWWWWWH.",
        ".BBWWAWWW.WH.", ".BBWWWWWW.WH.", "..HWWWWWW.HH.", "...WWWWWW....", "...WWWWWW....",
        "...WW..WW....", "...WW..WW....", "...WW..WW....", "..HHH..HHH...", "..DDD..DDD..."
      ], 64, 357, 5, { H: "#95a8a8", W: "#e2d9bd", V: "#263e4c", D: "#eaa86b", B: "#778c90", A: "#eea85e" });
      // Small console provides a warm counterpoint to the cool space landscape.
      rect(150, 414, 35, 25, "#7d918f");
      rect(154, 418, 27, 16, "#132a35");
      rect(158, 422, 13, 3, "#bbccab");
      rect(158, 428, 18, 2, "#6e9d9b");
      rect(165, 439, 5, 18, "#6e8288");
      rect(158, 454, 21, 4, "#7d918f");
      pixelLine(698, 419, 680, 458, "#69828a", 3);
      pixelLine(698, 419, 717, 458, "#69828a", 3);
      pixelLine(675, 405, 696, 426, "#94a8a7", 3);
      pixelLine(696, 426, 718, 405, "#94a8a7", 3);
      pixelLine(682, 412, 711, 412, "#617d86", 3);
      pixelLine(698, 416, 698, 396, "#b4c3b8", 2);
      rect(696, 393, 5, 5, "#e4aa6c");
      ctx.font = "9px monospace";
      ctx.fillStyle = "#748d97";
      ctx.fillText("GROUND CONTROL", 47, 343);
      ctx.fillText("N", CENTER.x - 3, 17);
      ctx.fillText("E", 650, CENTER.y + 3);
      ctx.fillStyle = "#b99b71";
      ctx.fillText("SOL / 01", CENTER.x - 24, CENTER.y + 49);

      probesRef.current.forEach((probe) => {
        if (probe.trail.length > 1) {
          for (let i = 0; i < probe.trail.length; i++) {
            ctx.globalAlpha = (i / probe.trail.length) * (probe.alive ? 0.55 : 0.14);
            rect(CENTER.x + probe.trail[i].x - 1, CENTER.y + probe.trail[i].y - 1, 2, 2, probe.color);
          }
          ctx.globalAlpha = 1;
        }
        if (!probe.alive) return;
        const x = CENTER.x + probe.x;
        const y = CENTER.y + probe.y;
        // Solar wings and body remain square to keep the low-resolution language.
        rect(x - 13, y - 5, 8, 10, "#263b49");
        rect(x - 12, y - 4, 6, 3, probe.color);
        rect(x - 12, y + 1, 6, 3, probe.color);
        rect(x + 5, y - 5, 8, 10, "#263b49");
        rect(x + 6, y - 4, 6, 3, probe.color);
        rect(x + 6, y + 1, 6, 3, probe.color);
        rect(x - 6, y - 1, 12, 2, "#d8cbb1");
        rect(x - 3, y - 5, 6, 10, "#efe0ba");
        rect(x - 2, y - 3, 4, 3, "#dca46d");
        rect(x - 1, y - 9, 2, 4, "#a9b9bd");
        ctx.fillStyle = "#81929b";
        ctx.font = "9px monospace";
        ctx.fillText(String(probe.id + 1).padStart(2, "0"), x + 18, y + 3);
      });

      ringsRef.current.forEach((ring) => {
        const progress = 1 - ring.life / ring.duration;
        ctx.globalAlpha = (1 - progress) * 0.7;
        const radius = 6 + progress * (ring.star ? 45 : 21);
        for (let i = 0; i < 16; i++) {
          const angle = i / 16 * Math.PI * 2;
          rect(CENTER.x + ring.x + Math.cos(angle) * radius, CENTER.y + ring.y + Math.sin(angle) * radius, 2, 2, ring.star ? "#efb76e" : "#b5d4c9");
        }
      });
      sparksRef.current.forEach((spark) => {
        ctx.globalAlpha = Math.max(0, spark.life / spark.duration);
        rect(CENTER.x + spark.x, CENTER.y + spark.y, spark.size, spark.size, spark.color);
      });
      ctx.globalAlpha = 1;
      const gesture = gestureRef.current;
      if (gesture) {
        const { x, y } = gesture.position;
        const velocity = gesture.dragged ? estimateThrowVelocity(gesture.samples, performance.now()) : { x: 0, y: 0 };
        const speed = Math.hypot(velocity.x, velocity.y);
        const arrowScale = Math.min(0.25, 90 / Math.max(1, speed));
        pixelLine(CENTER.x + x, CENTER.y + y, CENTER.x + x + velocity.x * arrowScale, CENTER.y + y + velocity.y * arrowScale, "#eac689", 2);
        ctx.strokeStyle = "#eac689";
        ctx.setLineDash([3, 4]);
        ctx.strokeRect(CENTER.x + x - 11, CENTER.y + y - 11, 22, 22);
        ctx.setLineDash([]);
        rect(CENTER.x + x - 3, CENTER.y + y - 3, 6, 6, "#f0d7a1");
        ctx.font = "10px monospace";
        ctx.fillStyle = "#f0d7a1";
        ctx.fillText(`${Math.round(speed)} u/s`, CENTER.x + x + 17, CENTER.y + y - 14);
      }


    };

    drawRef.current = draw;
    resetRuntimeRef.current = () => {
      simTime = 0; accumulator = 0; trailClock = 0; telemetryClock = 0; last = 0;
      contactCooldown.clear();
    };
    const resize = () => {
      const width = container.clientWidth;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round((width * H / W) * dpr));
      logicalScale = canvas.width / W;
      draw();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      last = 0;
      accumulator = 0;
      if (visible && !document.hidden && !pausedRef.current && !frame) frame = requestAnimationFrame(tick);
    }, { threshold: 0.05 });
    observer.observe(container);
    const visibilityChange = () => {
      last = 0;
      accumulator = 0;
      if (!document.hidden && visible && !pausedRef.current && !frame) frame = requestAnimationFrame(tick);
    };
    document.addEventListener("visibilitychange", visibilityChange);
    resumeRef.current = () => {
      last = 0;
      accumulator = 0;
      if (!destroyed && !document.hidden && visible && !frame) frame = requestAnimationFrame(tick);
    };

    function tick(now: number) {
      frame = 0;
      if (destroyed || document.hidden || !visible) { last = 0; return; }
      const delta = last ? Math.min((now - last) / 1000, 0.06) : 0;
      last = now;
      if (!pausedRef.current) {
        accumulator += delta;
        while (accumulator >= STEP) {
          emitEventsRef.current(stepPhysics(probesRef.current, STEP, gravityRef.current));
          sparksRef.current.forEach((spark) => {
            spark.x += spark.vx * STEP; spark.y += spark.vy * STEP; spark.life -= STEP;
          });
          sparksRef.current = sparksRef.current.filter((spark) => spark.life > 0);
          ringsRef.current.forEach((ring) => { ring.life -= STEP; });
          ringsRef.current = ringsRef.current.filter((ring) => ring.life > 0);
          simTime += STEP;
          trailClock += STEP;
          telemetryClock += STEP;
          accumulator -= STEP;
          if (trailClock >= 1 / 24) {
            trailClock = 0;
            probesRef.current.forEach((probe) => {
              if (probe.alive) {
                probe.trail.push({ x: probe.x, y: probe.y });
                if (probe.trail.length > 120) probe.trail.shift();
              } else if (probe.trail.length) {
                probe.trail.shift();
              }
            });
          }
        }
        if (telemetryClock >= 0.2) {
          telemetryClock = 0;
          const active = probesRef.current.filter((probe) => probe.alive).length;
          const { bounces, absorbed } = countersRef.current;
          setTelemetry((previous) => previous.active === active && previous.bounces === bounces && previous.absorbed === absorbed ? previous : { active, bounces, absorbed });
        }
        draw();
      } else {
        accumulator = 0;
      }
      if (!pausedRef.current) frame = requestAnimationFrame(tick);
    }
    resize();
    frame = requestAnimationFrame(tick);
    return () => {
      destroyed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibilityChange);
      drawRef.current = () => {};
      resumeRef.current = () => {};
      resetRuntimeRef.current = () => {};
      emitEventsRef.current = () => {};
      gestureRef.current = null;
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, []);

  return (
    <figure className="orbital-exhibit" aria-label="Interactive pixel-art orbital mechanics experiment">
      <div className="orbital-header">
        <span className="orbital-title"><span className="orbital-mark">✳</span> THE ORBITAL SANDBOX</span>
        <span className="orbital-status"><i className={paused ? "is-paused" : ""} />{paused ? "PAUSED" : "LIVE SIMULATION"}</span>
      </div>
      <div className="orbital-scene" ref={sceneRef}>
        <div className="orbital-coordinates" aria-hidden="true">EXPERIMENT 001<br /><span>INVERSE-SQUARE GRAVITY</span></div>
        <div className="orbital-formula" aria-hidden="true">F ∝ 1/r²</div>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          aria-label="Interactive orbital simulator. Click or tap to drop a probe with zero initial velocity. Drag then release to throw from the release point, using your recent movement speed. Probes bounce off one another and are absorbed by Sol. Equivalent Drop and Throw controls are below."
          aria-describedby="orbital-instructions"
          role="img"
          onPointerDown={(event) => {
            if (!event.isPrimary || event.button !== 0 || gestureRef.current) return;
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            const position = pointerPoint(event, event.currentTarget);
            gestureRef.current = { pointerId: event.pointerId, startClient: { x: event.clientX, y: event.clientY }, position, samples: [{ ...position, time: event.timeStamp }], dragged: false };
            drawRef.current();
          }}
          onPointerMove={(event) => {
            if (gestureRef.current?.pointerId !== event.pointerId) return;
            addPointerSample(event);
            if (pausedRef.current) {
              drawRef.current();
              if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
              previewTimerRef.current = setTimeout(() => {
                if (gestureRef.current) drawRef.current();
              }, 90);
            }
          }}
          onPointerUp={(event) => {
            const gesture = gestureRef.current;
            if (!gesture || gesture.pointerId !== event.pointerId) return;
            addPointerSample(event);
            const velocity = gesture.dragged ? estimateThrowVelocity(gesture.samples, event.timeStamp) : { x: 0, y: 0 };
            gestureRef.current = null;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            // Captured pointers may release beyond the canvas; retain measured
            // velocity but keep the new probe visible at the nearest edge.
            const position = {
              x: Math.max(8 - CENTER.x, Math.min(W - 8 - CENTER.x, gesture.position.x)),
              y: Math.max(8 - CENTER.y, Math.min(H - 8 - CENTER.y, gesture.position.y)),
            };
            launch(position, velocity, !gesture.dragged);
          }}
          onPointerCancel={(event) => {
            if (gestureRef.current?.pointerId !== event.pointerId) return;
            gestureRef.current = null;
            drawRef.current();
          }}
          onLostPointerCapture={(event) => {
            if (gestureRef.current?.pointerId !== event.pointerId) return;
            gestureRef.current = null;
            drawRef.current();
          }}
        />
        <span className="orbital-hint" aria-hidden="true">CLICK TO DROP<br />FLICK TO THROW <span>↗</span></span>
      </div>
      <div className="orbital-controls">
        <div className="orbital-buttons">
          <motion.button type="button" className="orbital-primary" whileTap={reducedMotion ? undefined : { scale: 0.97 }} onClick={togglePause} aria-label={paused ? "Play orbital simulation" : "Pause orbital simulation"}>
            <Icon kind={paused ? "play" : "pause"} />{paused ? "Play" : "Pause"}
          </motion.button>
          <button type="button" onClick={reset} aria-label="Reset probes and gravity"><Icon kind="reset" />Reset</button>
          <button type="button" onClick={() => keyboardLaunch(true)} aria-label="Drop a probe at the launch point with zero initial velocity"><Icon kind="add" />Drop</button>
          <button type="button" onClick={() => keyboardLaunch(false)} aria-label="Throw a probe from the launch point using the direction and speed controls below"><Icon kind="kick" />Throw</button>
        </div>
        <label className="orbital-gravity">GRAVITY
          <span className="orbital-range-end">0.1×</span>
          <input type="range" min="0.1" max="10" step="0.1" value={gravity} aria-label="Central gravity multiplier" aria-valuetext={`${gravity.toFixed(1)} times standard gravity`} onChange={(event) => {
            const value = clampGravity(Number(event.target.value));
            gravityRef.current = value;
            setGravity(value);
            setMessage(`Gravity set to ${value.toFixed(1)}×.${pausedRef.current ? " Press Play to see the effect." : ""}`);
          }} />
          <span className="orbital-range-end">10×</span>
          <output>{gravity.toFixed(1)}×</output>
        </label>
      </div>
      <details className="orbital-throw-details">
        <summary>Throw settings <span>direction + speed</span></summary>
        <div className="orbital-launch-settings" aria-label="Keyboard-accessible throw settings">
        <span>BUTTON THROW</span>
        <label>Direction <select aria-label="Throw direction" value={throwDirection} onChange={(event) => setThrowDirection(event.target.value)}>
          <option value="up">↑ Up</option><option value="right">→ Right</option><option value="down">↓ Down</option><option value="left">← Left</option>
        </select></label>
        <label>Speed <select aria-label="Throw speed in scaled units per second" value={throwSpeed} onChange={(event) => setThrowSpeed(Number(event.target.value))}>
          {[75, 140, 250, 450, MAX_SPEED].map((speed) => <option key={speed} value={speed}>{speed} u/s</option>)}
        </select></label>
        </div>
      </details>
      <div className="orbital-readout" aria-label="Simulation statistics">
        <span><i />{telemetry.active}/{MAX_PROBES} PROBES</span><span>{telemetry.bounces} BOUNCES</span><span>{telemetry.absorbed} SOL IMPACTS</span>
      </div>
      <figcaption className="orbital-caption">
        <span className="orbital-instructions" id="orbital-instructions">Tap to drop · drag and release to throw · hold still to release at rest</span>
        <span className="orbital-note" aria-live="polite">{message}</span>
        <span className="orbital-science">Toy 2D model · scaled flick speed (max 720 u/s) · equal-mass disk bounces · fixed Sol · no mutual gravity</span>
      </figcaption>
      <style jsx>{`
        .orbital-exhibit { width: 100%; margin: 0; overflow: hidden; background: #101e2b; border: 1px solid #34434d; color: #e3dfce; border-radius: 8px; box-shadow: 0 18px 45px rgba(6, 16, 25, .12); }
        .orbital-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 56px; padding: 0 23px; border-bottom: 1px solid #2c3b47; font-family: var(--font-mono, "Courier New"), monospace; font-size: 9px; font-weight: 600; letter-spacing: 1.5px; }
        .orbital-title { display: flex; align-items: center; gap: 9px; }
        .orbital-mark { color: #e8ae69; font-size: 20px; line-height: 1; }
        .orbital-status { display: flex; align-items: center; gap: 8px; color: #9cbcae; font-size: 8px; letter-spacing: 1px; white-space: nowrap; }
        .orbital-status i { width: 5px; height: 5px; background: #a8c6ac; box-shadow: 0 0 8px #a8c6ac55; }
        .orbital-status i.is-paused { background: #d5aa72; box-shadow: none; }
        .orbital-scene { position: relative; width: 100%; line-height: 0; }
        .orbital-scene canvas { display: block; width: 100%; height: auto; aspect-ratio: 760 / 490; cursor: crosshair; touch-action: none; user-select: none; }
        .orbital-coordinates, .orbital-formula, .orbital-hint { position: absolute; z-index: 1; pointer-events: none; font-family: var(--font-mono, "Courier New"), monospace; font-size: 9px; line-height: 1.8; letter-spacing: 1px; }
        .orbital-coordinates { left: 25px; top: 25px; color: #c1c0af; }
        .orbital-coordinates span { color: #687f8e; font-size: 8px; }
        .orbital-formula { right: 25px; top: 26px; color: #9da7a4; font-size: 15px; letter-spacing: 0; }
        .orbital-hint { left: 25px; top: 43%; max-width: 145px; color: #788d95; font-size: 7px; letter-spacing: .7px; }
        .orbital-hint span { margin-left: 5px; color: #e0b67f; font-size: 12px; }
        .orbital-controls { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; padding: 15px 20px; background: #142430; border-top: 1px solid #354650; }
        .orbital-buttons { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
        .orbital-buttons button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 8px 10px; min-height: 36px; border: 1px solid #3a4a53; border-radius: 3px; background: transparent; color: #c0c9c5; font-family: inherit; font-size: 11px; cursor: pointer; transition: color .15s, border-color .15s, background .15s; }
        .orbital-buttons :global(.orbital-primary) { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 8px 11px; min-height: 36px; background: #e8bc7e; border: 1px solid #e8bc7e; border-radius: 3px; color: #172530; font-family: inherit; font-size: 11px; cursor: pointer; }
        .orbital-buttons button:hover { border-color: #d0b68c; color: #f3e7ce; background: #253642; }
        .orbital-buttons :global(.orbital-primary:hover) { background: #f5d29e; border-color: #f5d29e; color: #172530; }
        .orbital-buttons button:focus-visible, .orbital-buttons :global(.orbital-primary:focus-visible), .orbital-gravity input:focus-visible { outline: 2px solid #e8bc7e; outline-offset: 4px; }
        .orbital-gravity { display: flex; align-items: center; flex: 1; justify-content: flex-end; gap: 8px; color: #91a4a9; font-family: var(--font-mono, "Courier New"), monospace; font-size: 8px; letter-spacing: 1px; }
        .orbital-gravity input { width: 110px; min-width: 70px; height: 16px; accent-color: #deb27a; cursor: pointer; }
        .orbital-gravity output { min-width: 30px; color: #d7cbb2; font-size: 10px; letter-spacing: 0; }
        .orbital-range-end { font-size: 8px; color: #b7c2bb; letter-spacing: 0; }
        .orbital-throw-details { border-top: 1px solid #2b3b46; }
        .orbital-throw-details summary { padding: 10px 20px; color: #bdcbc6; font-family: var(--font-mono, "Courier New"), monospace; font-size: 10px; cursor: pointer; }
        .orbital-throw-details summary span { float: right; color: #8098a2; font-size: 8px; padding-top: 2px; }
        .orbital-throw-details summary:focus-visible { outline: 2px solid #e8bc7e; outline-offset: -3px; }
        .orbital-launch-settings { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; padding: 10px 20px; border-top: 1px solid #2b3b46; font-family: var(--font-mono, "Courier New"), monospace; font-size: 8px; color: #a7b7b8; }
        .orbital-launch-settings > span { margin-right: auto; color: #829da4; letter-spacing: .8px; }
        .orbital-launch-settings label { display: flex; gap: 6px; align-items: center; }
        .orbital-launch-settings select { border: 1px solid #3a505a; border-radius: 2px; padding: 5px; background: #172b37; color: #d0dacf; min-height: 30px; font: inherit; cursor: pointer; }
        .orbital-launch-settings select:focus-visible { outline: 2px solid #e8bc7e; outline-offset: 3px; }
        .orbital-readout { display: flex; flex-wrap: wrap; gap: 12px 20px; padding: 10px 21px; border-top: 1px solid #2b3b46; color: #9db3b5; font: 8px var(--font-mono, "Courier New"), monospace; letter-spacing: .6px; }
        .orbital-readout span { display: inline-flex; align-items: center; gap: 6px; }
        .orbital-readout i { width: 4px; height: 4px; background: #9fbea8; }
        .orbital-instructions { color: #d7c9ac; font-size: 10px; line-height: 1.6; }
        .orbital-caption { display: flex; flex-direction: column; gap: 6px; padding: 13px 21px 15px; border-top: 1px solid #2b3b46; line-height: 1.5; }
        .orbital-note { color: #b6c1bd; font-size: 10px; min-height: 15px; }
        .orbital-science { color: #7f949d; font-family: var(--font-mono, "Courier New"), monospace; font-size: 8px; letter-spacing: .2px; }
        @media (max-width: 600px) {
          .orbital-header { padding: 0 14px; min-height: 48px; font-size: 8px; letter-spacing: 1px; }
          .orbital-status { font-size: 7px; letter-spacing: .4px; }
          .orbital-controls { padding: 12px 13px; gap: 14px; }
          .orbital-buttons { gap: 5px; }
          .orbital-buttons button, .orbital-buttons :global(.orbital-primary) { min-height: 40px; padding: 8px 11px; }
          .orbital-coordinates { left: 16px; top: 15px; font-size: 7px; }
          .orbital-coordinates span { font-size: 6px; }
          .orbital-formula { right: 16px; top: 15px; font-size: 12px; }
          .orbital-hint { left: 15px; top: 41%; max-width: 100px; font-size: 6px; line-height: 1.8; }
          .orbital-caption { padding: 12px 14px; }
          .orbital-gravity { margin-left: auto; flex-basis: 100%; justify-content: space-between; }
          .orbital-gravity input { flex: 1; max-width: 230px; }
          .orbital-throw-details summary { padding: 10px 14px; }
          .orbital-launch-settings { padding: 10px 14px; gap: 8px 10px; }
          .orbital-readout { padding: 10px 14px; gap: 12px; font-size: 7px; }
        }
        @media (prefers-reduced-motion: reduce) { .orbital-buttons button { transition: none; } }
      `}</style>
    </figure>
  );
}
