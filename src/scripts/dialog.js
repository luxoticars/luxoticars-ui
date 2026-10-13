/*
  Runtime fallbacks for `.dialog`. `Dialog.astro` installs them through a
  processed <script>, which Astro bundles once per page; HTML-API callers call
  `installDialogFallbacks()` themselves. Everything else a dialog does —
  opening, focus containment, Escape, focus return — is the platform's.

  Listeners are delegated to the document, so dialogs added after
  installation are covered, and installation is once per document.
*/

const installed = new WeakSet();
let pressedOnBackdrop = false;

const isDialog = (node) => node instanceof Element && node.matches("dialog.dialog");

/* Was the pointer on this dialog's backdrop? A click on ::backdrop is
   dispatched to the dialog itself, so the target is the dialog and the
   point lies outside its box. */
const onBackdrop = (event) => {
  const dialog = event.target;
  if (!isDialog(dialog) || !dialog.open) return false;
  const r = dialog.getBoundingClientRect();
  return event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom;
};

export function installDialogFallbacks(doc = globalThis.document) {
  if (!doc || installed.has(doc)) return;
  installed.add(doc);

  const nativeClosedBy = "closedBy" in doc.defaultView.HTMLDialogElement.prototype;

  /* returnValue survives a close that carries no value (Escape, the ✕
     command, a light dismiss), so a confirm closed with "delete", reopened
     and dismissed would still report "delete". Clear it when the dialog
     opens, and again when it is cancelled. */
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
      const dialog = event.target;
      if (!isDialog(dialog)) return;
      /* Safari has no closedby, so closedby="none" does not stop Escape there. */
      if (!nativeClosedBy && dialog.getAttribute("closedby") === "none") {
        event.preventDefault();
        return;
      }
      dialog.returnValue = "";
    },
    true,
  );

  if (nativeClosedBy) return;

  /* Safari: close a closedby="any" dialog on a backdrop click. Only when the
     press also started on the backdrop — a text selection dragged from inside
     the dialog ends in a click on the dialog too, and must not close it. */
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
