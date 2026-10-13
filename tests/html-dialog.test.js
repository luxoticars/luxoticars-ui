import { test } from "node:test";
import assert from "node:assert/strict";
import { createDialog, createDialogTrigger } from "../src/html/dialog.js";

const attrs = (html, tag) => {
  const m = html.match(new RegExp(`<${tag}\\b([^>]*)>`));
  assert.ok(m, `no <${tag}> in output`);
  return Object.fromEntries([...m[1].matchAll(/([\w:-]+)(?:="([^"]*)")?/g)].map(([, k, v]) => [k, v ?? ""]));
};

test("lightbox by default: labelled by its title, closes on backdrop, has a close button", () => {
  const html = createDialog({ id: "car", title: "Save this search?" });
  assert.deepEqual(attrs(html, "dialog"), {
    id: "car",
    class: "dialog dialog--lightbox",
    "aria-labelledby": "car-title",
    closedby: "any",
  });
  assert.match(html, /<h2 id="car-title" class="dialog__title">Save this search\?<\/h2>/);
  assert.deepEqual(attrs(html, "button"), {
    type: "button",
    class: "dialog__close",
    command: "close",
    commandfor: "car",
    "aria-label": "Close",
  });
  assert.match(html, /<svg class="dialog__close-icon"[^>]*aria-hidden="true"/);
});

test("confirm: alertdialog, described, Escape-only, no close button", () => {
  const html = createDialog({ id: "del", variant: "confirm", title: "Delete?", description: "Gone for good." });
  assert.deepEqual(attrs(html, "dialog"), {
    id: "del",
    class: "dialog dialog--confirm",
    role: "alertdialog",
    "aria-labelledby": "del-title",
    "aria-describedby": "del-desc",
    closedby: "closerequest",
  });
  assert.match(html, /<div id="del-desc" class="dialog__description">Gone for good\.<\/div>/);
  assert.doesNotMatch(html, /dialog__close/);
});

test("no aria-describedby and no body when there is neither description nor body", () => {
  const html = createDialog({ id: "x", title: "T" });
  assert.doesNotMatch(html, /aria-describedby/);
  assert.doesNotMatch(html, /dialog__body/);
});

test("children appear in contract order", () => {
  const html = createDialog({ id: "x", title: "T", description: "D", body: "<p>B</p>", footer: "<button>F</button>" });
  const order = [...html.matchAll(/class="(dialog__(?:header|title|close|body|description|footer))"/g)].map((m) => m[1]);
  assert.deepEqual(order, ["dialog__header", "dialog__title", "dialog__close", "dialog__body", "dialog__description", "dialog__footer"]);
});

test("footer is a method=dialog form, omitted when empty", () => {
  assert.match(createDialog({ id: "x", title: "T", footer: "<button>OK</button>" }), /<form method="dialog" class="dialog__footer"><button>OK<\/button><\/form>/);
  assert.doesNotMatch(createDialog({ id: "x", title: "T" }), /<form/);
});

test("size, side and dismiss map to classes and closedby", () => {
  assert.equal(attrs(createDialog({ id: "x", title: "T", size: "wide" }), "dialog").class, "dialog dialog--lightbox dialog--wide");
  assert.equal(attrs(createDialog({ id: "x", title: "T", variant: "panel", side: "end" }), "dialog").class, "dialog dialog--panel dialog--end");
  assert.equal(attrs(createDialog({ id: "x", title: "T", variant: "panel" }), "dialog").class, "dialog dialog--panel");
  assert.equal(attrs(createDialog({ id: "x", title: "T", dismiss: "none" }), "dialog").closedby, "none");
  assert.equal(attrs(createDialog({ id: "x", title: "T", className: "extra" }), "dialog").class, "dialog dialog--lightbox extra");
});

test("escapes title, description, closeLabel, className and id; body and footer are raw", () => {
  const html = createDialog({
    id: 'x"><script>',
    title: "<b>T</b>",
    description: "<i>D</i>",
    closeLabel: 'Shut "it"',
    className: '"><b',
    body: "<p>raw body</p>",
    footer: "<button>raw</button>",
  });
  assert.doesNotMatch(html, /x"><script>|"><b"/);
  assert.match(html, /id="x&quot;&gt;&lt;script&gt;"/);
  assert.match(html, /&lt;b&gt;T&lt;\/b&gt;/);
  assert.match(html, /&lt;i&gt;D&lt;\/i&gt;/);
  assert.match(html, /aria-label="Shut &quot;it&quot;"/);
  assert.match(html, /<p>raw body<\/p>/);
  assert.match(html, /<button>raw<\/button>/);
});

test("rejects invalid input with a message naming the dialog", () => {
  const cases = [
    [{ title: "T" }, /^Dialog: an `id` is required/],
    [{ id: "  ", title: "T" }, /^Dialog: an `id` is required/],
    [{ id: "car 1", title: "T" }, /^Dialog "car 1": the `id` cannot contain whitespace/],
    [{ id: "x" }, /^Dialog "x": a title is required/],
    [{ id: "x", title: "   " }, /^Dialog "x": a title is required/],
    [{ id: "x", variant: "confirm", title: "T" }, /^Dialog "x": a confirm needs a description/],
    [{ id: "x", variant: "confirm", title: "T", description: "D", dismiss: "any" }, /^Dialog "x": a confirm cannot be dismissed by a backdrop click/],
    [{ id: "x", variant: "modal", title: "T" }, /^Dialog "x": unknown variant "modal"/],
    [{ id: "x", title: "T", size: "huge" }, /^Dialog "x": unknown size "huge"/],
    [{ id: "x", variant: "panel", title: "T", side: "left" }, /^Dialog "x": unknown side "left"/],
    [{ id: "x", title: "T", dismiss: "click" }, /^Dialog "x": unknown dismiss "click"/],
    [{ id: "x", variant: "confirm", title: "T", description: "D", size: "wide" }, /^Dialog "x": `size` applies to the lightbox variant only/],
    [{ id: "x", title: "T", side: "end" }, /^Dialog "x": `side` applies to the panel variant only/],
  ];
  for (const [options, message] of cases) {
    assert.throws(() => createDialog(options), { message }, JSON.stringify(options));
  }
});

test("trigger: a button that shows the named dialog modally", () => {
  const html = createDialogTrigger({ for: "car", label: "Save <search>" });
  const a = attrs(html, "button");
  assert.equal(a.type, "button");
  assert.equal(a.command, "show-modal");
  assert.equal(a.commandfor, "car");
  assert.match(html, />Save &lt;search&gt;<\/button>$/);
  assert.throws(() => createDialogTrigger({ label: "x" }), { message: /^DialogTrigger: `for` must be the id of the dialog to open/ });
  assert.throws(() => createDialogTrigger({ for: "a b", label: "x" }), { message: /^DialogTrigger: `for` must be the id of the dialog to open/ });
});
