import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveProgramBadge } from "../src/utils/program-badge.js";
import { PROGRAM_BADGE_ICONS } from "../src/data/program-badge-icons.js";

/* The resolver decides everything a program badge renders, so the Astro
   component and the Marko tag only print its answer and cannot disagree. */

const ROSETTE = PROGRAM_BADGE_ICONS["top-rated-seller"];

test("artwork: every icon has a label and at least one path", () => {
  for (const [id, art] of Object.entries(PROGRAM_BADGE_ICONS)) {
    assert.ok(art.label.trim(), `${id} has a label`);
    assert.ok(art.paths.length > 0, `${id} has paths`);
    for (const path of art.paths) assert.match(path.d, /^M/, `${id}: each path starts with a moveto`);
  }
});

test("artwork: top-rated-seller is the spec's rosette, verbatim", () => {
  assert.equal(ROSETTE.label, "Top rated seller");
  assert.deepEqual(ROSETTE.paths, [
    { d: "M8.5 14.8L6.5 22L9.2 20.8L10.8 23L12 16.3ZM15.5 14.8L17.5 22L14.8 20.8L13.2 23L12 16.3Z" },
    {
      d: "M5 9.5a7 7 0 1 0 14 0a7 7 0 1 0-14 0ZM12 5.5L13.03 8.08L15.8 8.26L13.66 10.04L14.35 12.74L12 11.25L9.65 12.74L10.34 10.04L8.2 8.26L10.97 8.08Z",
      fillRule: "evenodd",
    },
  ]);
});

test("artwork: frozen, so no caller can repaint every badge on the page", () => {
  assert.ok(Object.isFrozen(PROGRAM_BADGE_ICONS));
  assert.ok(Object.isFrozen(ROSETTE));
  assert.ok(Object.isFrozen(ROSETTE.paths));
  assert.ok(Object.isFrozen(ROSETTE.paths[0]));
});

test("nothing to show: no icon and no text renders nothing", () => {
  assert.equal(resolveProgramBadge(), null);
  assert.equal(resolveProgramBadge({}), null);
  assert.equal(resolveProgramBadge({ text: "" }), null);
  assert.equal(resolveProgramBadge({ text: "   " }), null);
  assert.equal(resolveProgramBadge({ icon: "", text: null }), null);
});

test("icon + text: the text names the badge, so the icon is hidden", () => {
  assert.deepEqual(resolveProgramBadge({ icon: "top-rated-seller", text: "Top rated seller" }), {
    className: "program-badge",
    text: "Top rated seller",
    icon: { paths: ROSETTE.paths, role: undefined, label: undefined, hidden: "true" },
  });
});

test("icon + text: iconLabel is ignored, because the text names the badge", () => {
  const badge = resolveProgramBadge({ icon: "top-rated-seller", text: "Top rated seller", iconLabel: "Penjual terbaik" });
  assert.equal(badge.icon.label, undefined);
  assert.equal(badge.icon.hidden, "true");
});

test("icon only: the icon carries the name, defaulting to the icon's own label", () => {
  const badge = resolveProgramBadge({ icon: "top-rated-seller" });
  assert.deepEqual(badge.icon, { paths: ROSETTE.paths, role: "img", label: "Top rated seller", hidden: undefined });
  assert.equal(badge.text, undefined);
});

test("icon only: iconLabel overrides the default, trimmed", () => {
  const badge = resolveProgramBadge({ icon: "top-rated-seller", iconLabel: " Penjual terbaik " });
  assert.equal(badge.icon.label, "Penjual terbaik");
});

test("icon + whitespace-only text: treated as icon only, so the icon stays named", () => {
  const badge = resolveProgramBadge({ icon: "top-rated-seller", text: "   " });
  assert.equal(badge.text, undefined);
  assert.deepEqual(badge.icon, { paths: ROSETTE.paths, role: "img", label: "Top rated seller", hidden: undefined });
});

test("text only: no icon, and the text is trimmed", () => {
  assert.deepEqual(resolveProgramBadge({ text: "  Free inspection " }), {
    className: "program-badge",
    text: "Free inspection",
    icon: null,
  });
});

test("size: 24 adds the modifier; 16 is the default", () => {
  assert.equal(resolveProgramBadge({ text: "x", size: 24 }).className, "program-badge program-badge--24");
  assert.equal(resolveProgramBadge({ text: "x", size: 16 }).className, "program-badge");
  assert.equal(resolveProgramBadge({ text: "x" }).className, "program-badge");
  assert.equal(resolveProgramBadge({ text: "x", size: null }).className, "program-badge");
});

test("size: a numeric string counts as the number", () => {
  assert.equal(resolveProgramBadge({ text: "x", size: "24" }).className, "program-badge program-badge--24");
  assert.equal(resolveProgramBadge({ text: "x", size: "16" }).className, "program-badge");
});

test("className: the caller's classes follow the badge's own, in any form cn() accepts", () => {
  assert.equal(resolveProgramBadge({ text: "x", className: "mt-2" }).className, "program-badge mt-2");
  assert.equal(
    resolveProgramBadge({ text: "x", size: 24, className: ["mt-2", { hidden: false, ring: true }] }).className,
    "program-badge program-badge--24 mt-2 ring",
  );
});

test("rejects invalid input with a message naming the component", () => {
  assert.throws(() => resolveProgramBadge({ icon: "nope" }), {
    message: 'ProgramBadge: unknown icon "nope". Use one of: top-rated-seller.',
  });
  for (const key of ["toString", "constructor", "__proto__", "hasOwnProperty"]) {
    assert.throws(() => resolveProgramBadge({ icon: key, text: "x" }), {
      message: `ProgramBadge: unknown icon "${key}". Use one of: top-rated-seller.`,
    });
  }
  assert.throws(() => resolveProgramBadge({ text: "x", size: 20 }), {
    message: 'ProgramBadge: unknown size "20". Use one of: 16, 24.',
  });
  assert.throws(() => resolveProgramBadge({ text: "x", size: "large" }), {
    message: 'ProgramBadge: unknown size "large". Use one of: 16, 24.',
  });
  assert.throws(() => resolveProgramBadge({ icon: "top-rated-seller", iconLabel: "" }), {
    message: "ProgramBadge: an icon-only badge needs a non-empty `iconLabel` — it is the badge's only accessible name.",
  });
  assert.throws(() => resolveProgramBadge({ icon: "top-rated-seller", iconLabel: "  " }), /non-empty `iconLabel`/);
});

/* `false` is what `x={cond && "…"}` leaves behind when cond is falsy. It must
   mean "not set", exactly like leaving the prop out. */

test("false counts as unset: icon", () => {
  assert.doesNotThrow(() => resolveProgramBadge({ icon: false, text: "x" }));
  assert.deepEqual(resolveProgramBadge({ icon: false, text: "x" }), resolveProgramBadge({ text: "x" }));
  assert.equal(resolveProgramBadge({ icon: false }), null);
});

test("false counts as unset: text", () => {
  assert.deepEqual(
    resolveProgramBadge({ icon: "top-rated-seller", text: false }),
    resolveProgramBadge({ icon: "top-rated-seller" }),
  );
  assert.equal(resolveProgramBadge({ text: false }), null);
  assert.equal(resolveProgramBadge({ icon: false, text: false }), null);
});

test("false counts as unset: iconLabel", () => {
  const badge = resolveProgramBadge({ icon: "top-rated-seller", iconLabel: false });
  assert.deepEqual(badge, resolveProgramBadge({ icon: "top-rated-seller" }));
  assert.equal(badge.icon.label, "Top rated seller");
  assert.equal(resolveProgramBadge({ icon: "top-rated-seller", iconLabel: null }).icon.label, "Top rated seller");
});

test("false counts as unset: size", () => {
  assert.doesNotThrow(() => resolveProgramBadge({ text: "x", size: false }));
  assert.deepEqual(resolveProgramBadge({ text: "x", size: false }), resolveProgramBadge({ text: "x" }));
  assert.equal(resolveProgramBadge({ text: "x", size: false }).className, "program-badge");
});

test("a falsy icon (0, NaN) counts as no icon, so text alone renders", () => {
  for (const icon of [0, NaN]) {
    assert.deepEqual(resolveProgramBadge({ icon, text: "x" }), resolveProgramBadge({ text: "x" }));
    assert.equal(resolveProgramBadge({ icon, text: "x" }).icon, null);
  }
});

test("a truthy icon that is not an icon name still throws", () => {
  for (const icon of [true, 1, "nope"]) {
    assert.throws(() => resolveProgramBadge({ icon, text: "x" }), /ProgramBadge: unknown icon/);
  }
});

test("text: 0 is text, not unset, as in JSX", () => {
  assert.equal(resolveProgramBadge({ text: 0 }).text, "0");
  assert.equal(resolveProgramBadge({ icon: "top-rated-seller", text: 0 }).icon.hidden, "true");
});

test("icon + text: an empty iconLabel does not throw, and the icon stays hidden", () => {
  for (const iconLabel of ["", "  "]) {
    const badge = resolveProgramBadge({ icon: "top-rated-seller", text: "Top rated seller", iconLabel });
    assert.deepEqual(badge.icon, { paths: ROSETTE.paths, role: undefined, label: undefined, hidden: "true" });
  }
});

test("text only: iconLabel is ignored, because there is no icon to name", () => {
  assert.deepEqual(resolveProgramBadge({ text: "x", iconLabel: "Penjual terbaik" }), resolveProgramBadge({ text: "x" }));
  assert.deepEqual(resolveProgramBadge({ text: "x", iconLabel: "" }), resolveProgramBadge({ text: "x" }));
});

test("block: the class names follow the caller's block, so a renderer can own its stylesheet", () => {
  assert.equal(
    resolveProgramBadge({ text: "x", size: 24, className: "mt-2", block: "lx-program-badge" }).className,
    "lx-program-badge lx-program-badge--24 mt-2",
  );
  assert.equal(resolveProgramBadge({ text: "x" }).className, "program-badge");
});
