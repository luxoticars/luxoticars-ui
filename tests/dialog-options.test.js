import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveDialogOptions } from "../src/utils/dialog.js";

/* The resolver decides which parts a dialog renders, so the Astro component
   and the HTML builder only follow its answer and cannot disagree. */

const base = { id: "x", hasTitle: true, hasDescription: false, hasContent: false, hasFooter: false };

test("parts: a bare lightbox renders only its header, with the ✕", () => {
  const d = resolveDialogOptions(base);
  assert.deepEqual(d.parts, { close: true, body: false, footer: false });
  assert.equal(d.closeLabel, "Close");
});

test("parts: the body renders for a description, for content, or both", () => {
  assert.equal(resolveDialogOptions({ ...base, hasDescription: true }).parts.body, true);
  assert.equal(resolveDialogOptions({ ...base, hasContent: true }).parts.body, true);
  assert.equal(resolveDialogOptions({ ...base, hasDescription: true, hasContent: true }).parts.body, true);
});

test("parts: the footer renders exactly when footer content was supplied", () => {
  assert.equal(resolveDialogOptions({ ...base, hasFooter: true }).parts.footer, true);
  assert.equal(resolveDialogOptions(base).parts.footer, false);
});

test("closeLabel: passed through for lightbox and panel", () => {
  assert.equal(resolveDialogOptions({ ...base, closeLabel: "Tutup" }).closeLabel, "Tutup");
  assert.equal(resolveDialogOptions({ ...base, variant: "panel", closeLabel: "Tutup" }).closeLabel, "Tutup");
});

test("confirm: no ✕ and no close label, even when one is passed", () => {
  const d = resolveDialogOptions({
    ...base,
    variant: "confirm",
    hasDescription: true,
    hasFooter: true,
    closeLabel: "Tutup",
  });
  assert.equal(d.parts.close, false);
  assert.equal(d.closeLabel, undefined);
});
