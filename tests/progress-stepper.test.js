import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { resolveProgressStepper } from "../src/utils/progress-stepper.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");
const steps = [{ label: "A" }, { label: "B" }, { label: "C" }];
const states = (options) => resolveProgressStepper({ steps, ...options }).items.map((i) => i.state);

test("states follow `current`: before is complete, after is upcoming", () => {
  assert.deepEqual(states({ current: 1 }), ["complete", "current", "upcoming"]);
  assert.deepEqual(states({}), ["current", "upcoming", "upcoming"]);
  assert.deepEqual(states({ current: 3 }), ["complete", "complete", "complete"]);
  assert.deepEqual(states({ current: "1" }), ["complete", "current", "upcoming"]);
  assert.deepEqual(states({ current: false }), ["current", "upcoming", "upcoming"]);
});

test("a step's own state wins; loading sets aria-busy and error shows an icon", () => {
  const s = resolveProgressStepper({ steps: [{ label: "A" }, { label: "B", state: "loading" }, { label: "C" }], current: 1 });
  assert.equal(s.busy, true);
  assert.equal(s.items[1].status, "Loading");
  const e = resolveProgressStepper({ steps: [{ label: "A" }, { label: "B", state: "error" }], current: 1 });
  assert.equal(e.busy, false);
  assert.ok(e.items[1].icon && e.items[0].icon, "error and complete draw an icon, not a number");
  assert.equal(e.items[1].status, "Error");
});

test("aria-current marks exactly one step, and none when all are complete", () => {
  const marks = (o) => resolveProgressStepper({ steps, ...o }).items.filter((i) => i.ariaCurrent === "step").length;
  assert.equal(marks({ current: 1 }), 1);
  assert.equal(marks({ current: 3 }), 0);
  const two = resolveProgressStepper({ steps: [{ label: "A", state: "error" }, { label: "B", state: "loading" }] });
  assert.equal(two.items.filter((i) => i.ariaCurrent).length, 1);
});

test("classes, landmark name and translated status labels", () => {
  const s = resolveProgressStepper({ steps, orientation: "vertical", className: ["x", { y: true }], label: "التقدم", statusLabels: { complete: "مكتملة" } });
  assert.equal(s.className, "progress-stepper progress-stepper--vertical x y");
  assert.equal(s.label, "التقدم");
  assert.equal(s.items[0].status, "Current step");
  assert.equal(resolveProgressStepper({ steps, current: 1, statusLabels: { complete: "مكتملة" } }).items[0].status, "مكتملة");
  assert.equal(resolveProgressStepper({ steps }).label, "Progress");
  assert.match(resolveProgressStepper({ steps }).items[1].className, /progress-stepper__item--upcoming/);
});

test("rejects bad input with a clear message", () => {
  assert.throws(() => resolveProgressStepper({}), /steps/);
  assert.throws(() => resolveProgressStepper({ steps: [] }), /steps/);
  assert.throws(() => resolveProgressStepper({ steps: [{ label: " " }] }), /step 1 needs a `label`/);
  assert.throws(() => resolveProgressStepper({ steps, orientation: "diagonal" }), /orientation/);
  assert.throws(() => resolveProgressStepper({ steps, current: 4 }), /current/);
  assert.throws(() => resolveProgressStepper({ steps, current: 1.5 }), /current/);
  assert.throws(() => resolveProgressStepper({ steps: [{ label: "A", state: "done" }] }), /unknown state/);
  assert.throws(() => resolveProgressStepper({ steps, statusLabels: { done: "x" } }), /status label/);
});

test("Skin CSS: logical properties only, reflows by container, honours reduced motion", () => {
  const css = read("src/styles/skin/progress-stepper.css");
  assert.doesNotMatch(css, /\b(margin|padding|border)-(left|right)\b|\b(left|right)\s*:|text-align:\s*(left|right)/, "physical direction breaks RTL");
  assert.match(css, /@container \(min-width: 40rem\)/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /forced-colors: active/);
});

test("package exports the Skin and the stories exist", () => {
  const { exports } = JSON.parse(read("package.json"));
  assert.equal(exports["./styles/skin/progress-stepper.css"], "./src/styles/skin/progress-stepper.css");
  assert.ok(existsSync(join(root, "src/astro/ui/ProgressStepper.astro")));
  assert.match(read("stories/skin/progress-stepper.stories.ts"), /title:\s*["']Skin\/progress-stepper["']/);
  assert.match(read("stories/ui/ProgressStepper.stories.ts"), /title:\s*["']Components\/ProgressStepper["']/);
});
