/*
  Runtime support for `.dialog`. `Dialog.astro` installs it through a
  processed <script>, which Astro bundles once per page; HTML-API callers call
  `installDialogFallbacks()` themselves. Everything else a dialog does —
  opening, focus containment, Escape, focus return — is the platform's.

  Two separate jobs, installed together:

  - `clearStaleResults` — a fix every browser needs.
  - `emulateClosedBy` — a stand-in for `closedby` where the browser lacks it
    (Safari). It is self-contained, so it can be deleted on its own once
    every supported browser has `closedby`.

  Listeners are delegated to the document, so dialogs added after
  installation are covered, and installation is once per document.
*/

const installed = new WeakSet();

const isDialog = (node) => node instanceof Element && node.matches("dialog.dialog");

/* returnValue survives a close that carries no value (Escape, the ✕ command,
   a light dismiss), so a confirm closed with "delete", reopened and dismissed
   would still report "delete". Clear it when the dialog opens, and again when
   it is cancelled. */
function clearStaleResults(doc) {
  doc.addEventListener(
    "beforetoggle",
    (event) => {
      if (isDialog(event.target) && event.newState === "open") event.target.returnValue = "";
    },
    true,
  );
  doc.addEventListener(
    "cancel",
    (event) => {
      if (isDialog(event.target)) event.target.returnValue = "";
    },
    true,
  );
}

/* Was the pointer on this dialog's backdrop? A click on ::backdrop is
   dispatched to the dialog itself, so the target is the dialog and the point
   lies outside its box. */
const onBackdrop = (event) => {
  const dialog = event.target;
  if (!isDialog(dialog) || !dialog.open) return false;
  const r = dialog.getBoundingClientRect();
  return event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom;
};

/* Safari has no `closedby`: dismiss="none" must not yield to Escape, and
   dismiss="any" must close on a backdrop click. */
function emulateClosedBy(doc) {
  doc.addEventListener(
    "cancel",
    (event) => {
      if (isDialog(event.target) && event.target.getAttribute("closedby") === "none") event.preventDefault();
    },
    true,
  );

  /* Only when the press also started on the backdrop — a text selection
     dragged from inside the dialog ends in a click on the dialog too, and must
     not close it. Per document, like everything else here. */
  let pressedOnBackdrop = false;
  doc.addEventListener("pointerdown", (event) => {
    pressedOnBackdrop = onBackdrop(event);
  });
  doc.addEventListener("click", (event) => {
    const dialog = event.target;
    if (pressedOnBackdrop && onBackdrop(event) && dialog.getAttribute("closedby") === "any") {
      dialog.close("");
    }
    pressedOnBackdrop = false;
  });
}

export function installDialogFallbacks(doc = globalThis.document) {
  if (!doc || installed.has(doc)) return;
  installed.add(doc);

  clearStaleResults(doc);
  if (!("closedBy" in doc.defaultView.HTMLDialogElement.prototype)) emulateClosedBy(doc);
}
