import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

// Compile only the dependency-free physics module in memory. This keeps the
// regression suite usable with Node and the project's existing TypeScript
// dependency, without a browser, a Next build, or generated files in the repo.
const sourceUrl = new URL('../lib/orbital-physics.ts', import.meta.url);
const compiled = ts.transpileModule(readFileSync(sourceUrl, 'utf8'), {
  fileName: 'orbital-physics.ts',
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
    isolatedModules: true,
  },
  reportDiagnostics: true,
});
const errors = (compiled.diagnostics ?? []).filter(
  diagnostic => diagnostic.category === ts.DiagnosticCategory.Error,
);
assert.equal(errors.length, 0, errors.map(error =>
  ts.flattenDiagnosticMessageText(error.messageText, '\n'),
).join('\n'));
const physics = await import(
  `data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`
);
const {
  BASE_MU,
  FIXED_DT,
  STAR_RADIUS,
  PROBE_RADIUS,
  MAX_SPEED,
  MAX_PROBES,
  createProbe,
  createInitialProbes,
  createSimulationState,
  clampGravity,
  estimateThrowVelocity,
  stepPhysics,
} = physics;

const speed = vector => Math.hypot(vector.x, vector.y);
const near = (actual, expected, tolerance = 1e-7) => {
  assert.ok(Math.abs(actual - expected) <= tolerance,
    `Expected ${actual} to be within ${tolerance} of ${expected}`);
};
const finiteProbe = probe => {
  for (const field of ['x', 'y', 'vx', 'vy', 'radius']) {
    assert.ok(Number.isFinite(probe[field]), `Probe ${probe.id}: ${field} must be finite`);
  }
};

test('physics constants keep the supported sandbox limits', () => {
  assert.equal(BASE_MU, 420000);
  assert.equal(FIXED_DT, 1 / 240);
  assert.equal(STAR_RADIUS, 24);
  assert.equal(PROBE_RADIUS, 8);
  assert.equal(MAX_SPEED, 720);
  assert.equal(MAX_PROBES, 16);
});

test('a click/drop creates a live probe with zero initial velocity', () => {
  const probe = createProbe(1, { x: 180, y: -90 });
  assert.equal(probe.id, 1);
  assert.equal(probe.x, 180);
  assert.equal(probe.y, -90);
  assert.equal(probe.vx, 0);
  assert.equal(probe.vy, 0);
  assert.equal(probe.radius, PROBE_RADIUS);
  assert.equal(probe.alive, true);
});

test('reset factories restore the original three trajectories and default gravity', () => {
  const initial = createSimulationState();
  const edited = createSimulationState();
  assert.deepEqual(edited, initial);
  assert.equal(initial.gravity, 1);
  assert.equal(initial.probes.length, 3);
  assert.equal(new Set(initial.probes.map(probe => probe.id)).size, 3);
  assert.deepEqual(createInitialProbes(), initial.probes);
  assert.notEqual(initial.probes, edited.probes);
  for (let index = 0; index < initial.probes.length; index++) {
    assert.notEqual(initial.probes[index], edited.probes[index]);
  }
  edited.gravity = 10;
  stepPhysics(edited.probes, 0.05, edited.gravity);
  edited.probes[0].alive = false;
  edited.probes.push(createProbe(99, { x: 250, y: 0 }));
  assert.deepEqual(createSimulationState(), initial,
    'Reset must return fresh defaults unaffected by previous simulation state');
});

test('extreme launch velocities are capped while preserving their direction', () => {
  const probe = createProbe(1, { x: 200, y: 200 }, { x: 30000, y: -40000 });
  near(Math.hypot(probe.vx, probe.vy), MAX_SPEED);
  near(probe.vy / probe.vx, -4 / 3);
});

test('missing, single-point, and stationary gestures release at zero speed', () => {
  for (const samples of [
    [],
    [{ x: 10, y: 15, time: 20 }],
    [{ x: 10, y: 15, time: 0 }, { x: 10, y: 15, time: 100 }],
  ]) {
    const velocity = estimateThrowVelocity(samples, 100);
    near(speed(velocity), 0);
  }
});

test('the same gesture distance thrown twice as quickly produces twice the speed', () => {
  const fast = estimateThrowVelocity([
    { x: 0, y: 0, time: 0 },
    { x: 40, y: 0, time: 25 },
    { x: 80, y: 0, time: 50 },
  ], 50);
  const slow = estimateThrowVelocity([
    { x: 0, y: 0, time: 0 },
    { x: 40, y: 0, time: 50 },
    { x: 80, y: 0, time: 100 },
  ], 100);
  assert.ok(speed(slow) > 0);
  near(speed(fast) / speed(slow), 2);
});

test('throw speed is independent of pointer-event sampling density', () => {
  const sparse = [{ x: 0, y: 0, time: 0 }, { x: 50, y: 0, time: 50 }];
  const dense = Array.from({ length: 11 }, (_, index) => ({
    x: index * 5, y: 0, time: index * 5,
  }));
  near(speed(estimateThrowVelocity(sparse, 50)), speed(estimateThrowVelocity(dense, 50)));
});

test('many small coalesced movements still produce the same release speed', () => {
  const sparse = [{ x: 0, y: 0, time: 0 }, { x: 20, y: 0, time: 100 }];
  const fine = Array.from({ length: 101 }, (_, index) => ({
    x: index * 0.2, y: 0, time: index,
  }));
  const expected = estimateThrowVelocity(sparse, 100);
  const actual = estimateThrowVelocity(fine, 100);
  assert.ok(speed(actual) > 0, 'Subpixel samples must accumulate into real movement');
  near(speed(actual), speed(expected));
});

test('old movement and a long initial hold do not dilute the recent release gesture', () => {
  const recent = [
    { x: 0, y: 0, time: 900 },
    { x: 25, y: 10, time: 925 },
    { x: 50, y: 20, time: 950 },
    { x: 75, y: 30, time: 975 },
    { x: 100, y: 40, time: 1000 },
  ];
  const withHistory = [
    { x: -1000, y: -1000, time: 0 },
    { x: 0, y: 0, time: 100 },
    ...recent,
  ];
  const expected = estimateThrowVelocity(recent, 1000);
  const actual = estimateThrowVelocity(withHistory, 1000);
  assert.ok(speed(actual) > 0);
  near(actual.x, expected.x);
  near(actual.y, expected.y);
});

test('pausing before release drops the probe instead of reusing stale movement', () => {
  const moving = [{ x: 0, y: 0, time: 0 }, { x: 80, y: 0, time: 40 }];
  near(speed(estimateThrowVelocity(moving, 200)), 0);
  near(speed(estimateThrowVelocity([
    ...moving,
    { x: 80, y: 0, time: 120 },
    { x: 80, y: 0, time: 200 },
  ], 200)), 0);
});

test('the release vector retains direction and caps extreme throw speed', () => {
  const velocity = estimateThrowVelocity([
    { x: 0, y: 0, time: 0 },
    { x: -10000, y: 5000, time: 10 },
  ], 10);
  assert.ok(velocity.x < 0 && velocity.y > 0);
  assert.ok(speed(velocity) <= MAX_SPEED + 1e-7);
  assert.ok(speed(velocity) > 0);
  near(velocity.y / velocity.x, -0.5);
});

test('gravity controls clamp to the supported 0.1x–10x interval', () => {
  assert.equal(clampGravity(-4), 0.1);
  assert.equal(clampGravity(0.1), 0.1);
  assert.equal(clampGravity(1), 1);
  assert.equal(clampGravity(10), 10);
  assert.equal(clampGravity(100), 10);
  assert.equal(clampGravity(Number.NaN), 1);
});

test('paused or invalid-duration steps leave the simulation untouched', () => {
  for (const duration of [0, -1, Number.NaN, Infinity]) {
    const probes = createInitialProbes();
    const before = structuredClone(probes);
    assert.deepEqual(stepPhysics(probes, duration, 10), []);
    assert.deepEqual(probes, before);
  }
});

test('long frame gaps are capped rather than producing a giant simulation jump', () => {
  const normal = createInitialProbes();
  const stalled = createInitialProbes();
  const normalEvents = stepPhysics(normal, 0.05, 10);
  const stalledEvents = stepPhysics(stalled, 60, 10);
  assert.deepEqual(stalled, normal);
  assert.deepEqual(stalledEvents, normalEvents);
});

test('gravity points toward Sol and 10x accelerates 100 times more than 0.1x', () => {
  const low = createProbe(1, { x: 200, y: 0 });
  const high = createProbe(2, { x: 200, y: 0 });
  stepPhysics([low], FIXED_DT, 0.1);
  stepPhysics([high], FIXED_DT, 10);
  assert.ok(low.vx < 0 && high.vx < 0);
  near(low.vy, 0);
  near(high.vy, 0);
  near(high.vx / low.vx, 100, 0.01);
});

test('head-on probe collisions bounce both bodies and report a collision', () => {
  const left = createProbe(1, { x: -PROBE_RADIUS, y: 200 }, { x: 60, y: 0 });
  const right = createProbe(2, { x: PROBE_RADIUS, y: 200 }, { x: -60, y: 0 });
  const events = stepPhysics([left, right], FIXED_DT, 0.1);
  assert.ok(left.vx < 0, 'Left probe must bounce to the left');
  assert.ok(right.vx > 0, 'Right probe must bounce to the right');
  assert.ok(left.alive && right.alive);
  assert.ok(events.some(event => event.type === 'probe'
    && event.probeIds.includes(left.id) && event.probeIds.includes(right.id)));
  near(left.vx + right.vx, 0, 0.01);
  finiteProbe(left);
  finiteProbe(right);
});

test('opposing maximum-speed probes bounce instead of tunneling through each other', () => {
  const left = createProbe(1, { x: -20, y: 200 }, { x: MAX_SPEED, y: 0 });
  const right = createProbe(2, { x: 20, y: 200 }, { x: -MAX_SPEED, y: 0 });
  const events = stepPhysics([left, right], 0.05, 0.1);
  assert.ok(left.alive && right.alive);
  assert.ok(left.x < right.x, 'Colliding probes must not swap sides');
  assert.ok(left.vx < 0 && right.vx > 0, 'Both probes must reverse their approaching velocity');
  assert.ok(events.some(event => event.type === 'probe'));
  assert.ok(Math.hypot(left.x - right.x, left.y - right.y) >= 2 * PROBE_RADIUS);
  for (const probe of [left, right]) {
    finiteProbe(probe);
    assert.ok(Math.hypot(probe.vx, probe.vy) <= MAX_SPEED + 1e-7);
  }
});

test('coincident stationary probes separate without NaN or explosive velocity', () => {
  const first = createProbe(1, { x: 200, y: 0 });
  const second = createProbe(2, { x: 200, y: 0 });
  stepPhysics([first, second], FIXED_DT, 0.1);
  finiteProbe(first);
  finiteProbe(second);
  assert.ok(Math.hypot(first.x - second.x, first.y - second.y) >= 2 * PROBE_RADIUS - 1e-5,
    'The overlap should be resolved even when the centres are identical');
  assert.ok(Math.hypot(first.vx, first.vy) <= MAX_SPEED);
  assert.ok(Math.hypot(second.vx, second.vy) <= MAX_SPEED);
});

test('a fast inward launch hits Sol and emits only one hit for the consumed probe', () => {
  const probe = createProbe(1, { x: -(STAR_RADIUS + PROBE_RADIUS + 10), y: 0 },
    { x: MAX_SPEED, y: 0 });
  const events = stepPhysics([probe], 0.05, 10);
  assert.equal(probe.alive, false);
  const hits = events.filter(event => event.type === 'star' && event.probeIds.includes(probe.id));
  assert.equal(hits.length, 1);
  assert.ok(Number.isFinite(hits[0].x) && Number.isFinite(hits[0].y));
  near(Math.hypot(hits[0].x, hits[0].y), STAR_RADIUS + PROBE_RADIUS);
  assert.equal(stepPhysics([probe], 0.05, 10).filter(event => event.type === 'star').length, 0);
});

test('swept Sol contact catches a fast grazing path with both endpoints outside', () => {
  const contactRadius = STAR_RADIUS + PROBE_RADIUS;
  const start = { x: -MAX_SPEED * FIXED_DT / 2, y: Math.sqrt(contactRadius ** 2 - 0.5 ** 2) };
  const probe = createProbe(1, start, { x: MAX_SPEED, y: 0 });
  const distance = Math.hypot(start.x, start.y);
  const force = -BASE_MU * 0.1 / distance ** 3;
  // The unclipped integration endpoint also lies outside. Endpoint-only hit
  // detection would miss the short chord that actually passes through Sol.
  const unclippedEnd = {
    x: start.x + MAX_SPEED * FIXED_DT + 0.5 * force * start.x * FIXED_DT ** 2,
    y: start.y + 0.5 * force * start.y * FIXED_DT ** 2,
  };
  assert.ok(distance > contactRadius);
  assert.ok(Math.hypot(unclippedEnd.x, unclippedEnd.y) > contactRadius);
  const events = stepPhysics([probe], FIXED_DT, 0.1);
  assert.equal(probe.alive, false, 'The swept segment must hit even when its endpoints do not');
  assert.equal(events.filter(event => event.type === 'star').length, 1);
  near(Math.hypot(probe.x, probe.y), contactRadius);
});

test('a probe dropped inside Sol is absorbed immediately without a singularity', () => {
  const probe = createProbe(1, { x: 0, y: 0 });
  const events = stepPhysics([probe], FIXED_DT, 10);
  assert.equal(probe.alive, false);
  assert.equal(events.filter(event => event.type === 'star').length, 1);
  finiteProbe(probe);
});

test('sustained maximum-gravity simulation stays finite at the probe limit', () => {
  let seed = 123456789;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  let nextId = 1;
  let probes = [];
  let simulatedProbeSteps = 0;
  for (let frame = 0; frame < 1800; frame++) {
    probes = probes.filter(probe => probe.alive);
    while (probes.length < MAX_PROBES) {
      const angle = random() * Math.PI * 2;
      const radius = 100 + random() * 250;
      probes.push(createProbe(nextId++, {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      }, {
        x: (random() - 0.5) * MAX_SPEED,
        y: (random() - 0.5) * MAX_SPEED,
      }));
    }
    const events = stepPhysics(probes, 1 / 60, 10);
    for (const probe of probes) {
      finiteProbe(probe);
      assert.ok(Math.hypot(probe.vx, probe.vy) <= MAX_SPEED + 1e-7,
        `Probe ${probe.id}: long-running 10x simulation must respect the speed cap`);
      simulatedProbeSteps++;
    }
    for (const event of events) {
      for (const field of ['x', 'y', 'speed']) {
        assert.ok(Number.isFinite(event[field]), `${event.type} event ${field} must be finite`);
      }
    }
  }
  assert.equal(simulatedProbeSteps, 1800 * MAX_PROBES);
});
