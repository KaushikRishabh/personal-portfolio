/** A small, deterministic 2D toy model. Positions are in scaled canvas units. */
export type Point = { x: number; y: number };
export type PhysicsProbe = Point & { id: number; vx: number; vy: number; radius: number; alive: boolean };
export type MotionSample = Point & { time: number };
export type CollisionEvent = Point & { type: "probe" | "star" | "escape"; probeIds: number[]; speed: number };

export const BASE_MU = 420000;
export const FIXED_DT = 1 / 240;
export const STAR_RADIUS = 24;
export const PROBE_RADIUS = 8;
export const MAX_SPEED = 720;
export const MAX_PROBES = 16;
export const THROW_SCALE = 0.35;
const RESTITUTION = 0.82;
const ESCAPE_RADIUS = 1100;

const finite = (value: number, fallback = 0) => Number.isFinite(value) ? value : fallback;
export const clampGravity = (value: number) => Math.min(10, Math.max(0.1, finite(value, 1)));

function limitVelocity(x: number, y: number): Point {
  x = finite(x);
  y = finite(y);
  const speed = Math.hypot(x, y);
  const scale = speed > MAX_SPEED ? MAX_SPEED / speed : 1;
  return { x: x * scale, y: y * scale };
}

export function createProbe(id: number, position: Point, velocity: Point = { x: 0, y: 0 }): PhysicsProbe {
  const v = limitVelocity(velocity.x, velocity.y);
  return { id, x: finite(position.x), y: finite(position.y), vx: v.x, vy: v.y, radius: PROBE_RADIUS, alive: true };
}

export function createInitialProbes(): PhysicsProbe[] {
  return [[90, -0.95, 1], [153, 2.85, 0.93], [199, 0.65, 0.91]].map(([radius, angle, factor], id) => {
    const speed = Math.sqrt(BASE_MU / radius) * factor;
    return createProbe(id, { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius }, { x: -Math.sin(angle) * speed, y: Math.cos(angle) * speed });
  });
}

export function createSimulationState(): { probes: PhysicsProbe[]; gravity: number } {
  return { probes: createInitialProbes(), gravity: 1 };
}

/** Time is PointerEvent.timeStamp in milliseconds. A held release has no momentum. */
export function estimateThrowVelocity(samples: MotionSample[], releaseTime: number): Point {
  const points = samples.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.time) && p.time <= releaseTime);
  if (points.length < 2) return { x: 0, y: 0 };
  let movedAt = -Infinity;
  let movementAnchor = points[0];
  for (let i = 1; i < points.length; i++) {
    // Accumulate subpixel/coalesced movement, rather than requiring any one
    // event to cross the threshold. Velocity must not depend on event density.
    if (Math.hypot(points[i].x - movementAnchor.x, points[i].y - movementAnchor.y) > 0.25) {
      movedAt = points[i].time;
      movementAnchor = points[i];
    }
  }
  if (releaseTime - movedAt > 80) return { x: 0, y: 0 };
  const end = points[points.length - 1];
  const cutoff = releaseTime - 100;
  let start = points[0];
  for (let i = 1; i < points.length; i++) {
    if (points[i].time >= cutoff) {
      const before = points[i - 1];
      const after = points[i];
      const span = after.time - before.time;
      if (before.time < cutoff && span > 0) {
        const fraction = (cutoff - before.time) / span;
        start = { x: before.x + (after.x - before.x) * fraction, y: before.y + (after.y - before.y) * fraction, time: cutoff };
      } else start = before;
      break;
    }
  }
  const milliseconds = end.time - start.time;
  if (milliseconds <= 0) return { x: 0, y: 0 };
  return limitVelocity((end.x - start.x) * 1000 / milliseconds * THROW_SCALE, (end.y - start.y) * 1000 / milliseconds * THROW_SCALE);
}

/** First swept segment / circle contact; also catches a probe created inside Sol. */
function starContact(from: Point, to: Point, radius: number): Point | null {
  const c = from.x * from.x + from.y * from.y - radius * radius;
  if (c <= 0) return { x: from.x, y: from.y };
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const a = dx * dx + dy * dy;
  if (a === 0) return null;
  const b = 2 * (from.x * dx + from.y * dy);
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return null;
  const t = (-b - Math.sqrt(discriminant)) / (2 * a);
  return t >= 0 && t <= 1 ? { x: from.x + dx * t, y: from.y + dy * t } : null;
}

/**
 * Mutates bodies. Fixed substeps + bounded speeds keep pair movement below a
 * collision diameter; swept Sol contact prevents fast shots crossing the star.
 * Equal-mass disk contacts are slightly inelastic, with overlap correction.
 */
export function stepPhysics(probes: PhysicsProbe[], dt = FIXED_DT, gravity = 1): CollisionEvent[] {
  const events: CollisionEvent[] = [];
  if (!Number.isFinite(dt) || dt <= 0) return events;
  const duration = Math.min(dt, 0.05);
  const steps = Math.max(1, Math.ceil(duration / FIXED_DT));
  const h = duration / steps;
  const mu = BASE_MU * clampGravity(gravity);
  const absorb = (probe: PhysicsProbe, at: Point) => {
    probe.x = at.x; probe.y = at.y; probe.alive = false;
    events.push({ type: "star", x: at.x, y: at.y, probeIds: [probe.id], speed: Math.hypot(probe.vx, probe.vy) });
  };
  for (let step = 0; step < steps; step++) {
    for (const probe of probes) {
      if (!probe.alive) continue;
      if (![probe.x, probe.y, probe.vx, probe.vy].every(Number.isFinite)) { probe.alive = false; continue; }
      probe.radius = PROBE_RADIUS;
      const limited = limitVelocity(probe.vx, probe.vy);
      probe.vx = limited.x; probe.vy = limited.y;
      const old = { x: probe.x, y: probe.y };
      const contactRadius = STAR_RADIUS + probe.radius;
      const r = Math.max(contactRadius, Math.hypot(probe.x, probe.y));
      const force = -mu / (r * r * r);
      const ax = force * probe.x;
      const ay = force * probe.y;
      probe.x += probe.vx * h + 0.5 * ax * h * h;
      probe.y += probe.vy * h + 0.5 * ay * h * h;
      const contact = starContact(old, probe, contactRadius);
      if (contact) { absorb(probe, contact); continue; }
      const nextR = Math.hypot(probe.x, probe.y);
      if (nextR > ESCAPE_RADIUS) {
        probe.alive = false;
        events.push({ type: "escape", x: probe.x, y: probe.y, probeIds: [probe.id], speed: Math.hypot(probe.vx, probe.vy) });
        continue;
      }
      const nextForce = -mu / (nextR * nextR * nextR);
      const velocity = limitVelocity(probe.vx + 0.5 * (ax + nextForce * probe.x) * h, probe.vy + 0.5 * (ay + nextForce * probe.y) * h);
      probe.vx = velocity.x; probe.vy = velocity.y;
    }
    // A few bounded solver passes also untangle simultaneously spawned probes.
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 0; i < probes.length; i++) {
        const a = probes[i];
        if (!a.alive) continue;
        for (let j = i + 1; j < probes.length; j++) {
          const b = probes[j];
          if (!b.alive) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distance = Math.hypot(dx, dy);
          const diameter = a.radius + b.radius;
          if (distance > diameter) continue;
          const relativeX = b.vx - a.vx;
          const relativeY = b.vy - a.vy;
          const relativeSpeed = Math.hypot(relativeX, relativeY);
          const nx = distance > 0.00001 ? dx / distance : relativeSpeed > 0.00001 ? -relativeX / relativeSpeed : 1;
          const ny = distance > 0.00001 ? dy / distance : relativeSpeed > 0.00001 ? -relativeY / relativeSpeed : 0;
          const normalSpeed = relativeX * nx + relativeY * ny;
          const overlap = Math.max(0, diameter - distance);
          const correction = (overlap + 0.001) * 0.5;
          const oldA = { x: a.x, y: a.y };
          const oldB = { x: b.x, y: b.y };
          a.x -= nx * correction; a.y -= ny * correction;
          b.x += nx * correction; b.y += ny * correction;
          if (normalSpeed < 0) {
            const impulse = -(1 + RESTITUTION) * normalSpeed * 0.5;
            a.vx -= impulse * nx; a.vy -= impulse * ny;
            b.vx += impulse * nx; b.vy += impulse * ny;
            const av = limitVelocity(a.vx, a.vy); const bv = limitVelocity(b.vx, b.vy);
            a.vx = av.x; a.vy = av.y; b.vx = bv.x; b.vy = bv.y;
          }
          if (pass === 0 && (normalSpeed < -0.5 || overlap > 0.5)) {
            events.push({ type: "probe", x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, probeIds: [a.id, b.id], speed: Math.max(0, -normalSpeed) });
          }
          const hitA = starContact(oldA, a, STAR_RADIUS + a.radius);
          const hitB = starContact(oldB, b, STAR_RADIUS + b.radius);
          if (hitA) absorb(a, hitA);
          if (hitB) absorb(b, hitB);
          if (!a.alive) break;
        }
      }
    }
  }
  return events;
}
