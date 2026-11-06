/*
  Progressive enhancement for `.scrolling-item-cards`: reveal prev/next, scroll
  by one item, enable/disable at the ends. Native overflow remains the source
  of truth. Installation on the same root twice is a no-op.
*/

const installed = new WeakSet();

const prefersReducedMotion = (win) =>
  Boolean(win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);

function gapOf(el, win) {
  const style = win.getComputedStyle(el);
  const raw = style.columnGap || style.gap || "0";
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

function measureStep(root, scrollport, win) {
  const item =
    scrollport.querySelectorAll?.(".scrolling-item-cards__item")?.[0] ||
    root.querySelector(".scrolling-item-cards__item");
  const width = item?.offsetWidth || 0;
  return width + gapOf(scrollport, win);
}

function activeScrollport(root, win) {
  const flow = root.querySelector(".scrolling-item-cards__flow");
  const track = root.querySelector(".scrolling-item-cards__track");
  const titleCard = root.querySelector(".scrolling-item-cards__title-card");
  const wide = Boolean(win.matchMedia?.("(min-width: 768px)")?.matches);
  if (titleCard && wide && flow) return flow;
  return track || flow;
}

function update(root, prev, next, scrollport) {
  const max = Math.max(0, scrollport.scrollWidth - scrollport.clientWidth);
  const left = scrollport.scrollLeft;
  const eps = 1;
  const overflow = max > eps;
  const atStart = left <= eps;
  const atEnd = left >= max - eps;
  // Hiding or disabling the focused control moves focus to the body immediately.
  const active = root.ownerDocument.activeElement;

  if (!overflow) {
    prev.hidden = true;
    next.hidden = true;
    prev.disabled = true;
    next.disabled = true;
  } else {
    prev.hidden = false;
    next.hidden = false;
    prev.disabled = atStart;
    next.disabled = atEnd;
  }

  if (active === prev && (prev.disabled || prev.hidden)) {
    if (!next.disabled && !next.hidden) next.focus();
    else root.focus();
  } else if (active === next && (next.disabled || next.hidden)) {
    if (!prev.disabled && !prev.hidden) prev.focus();
    else root.focus();
  }
}

export function initScrollingItemCards(root) {
  if (!root || installed.has(root)) return;
  const doc = root.ownerDocument;
  const win = doc?.defaultView;
  if (!win) return;
  installed.add(root);

  const prev = root.querySelector(".scrolling-item-cards__control--prev");
  const next = root.querySelector(".scrolling-item-cards__control--next");
  if (!prev || !next) return;

  if (!root.hasAttribute("tabindex")) root.setAttribute("tabindex", "-1");

  let scrollport = activeScrollport(root, win);

  const refreshPort = () => {
    scrollport = activeScrollport(root, win);
  };

  const sync = () => {
    refreshPort();
    update(root, prev, next, scrollport);
  };

  const behavior = () => (prefersReducedMotion(win) ? "auto" : "smooth");

  prev.addEventListener("click", () => {
    refreshPort();
    scrollport.scrollBy({ left: -measureStep(root, scrollport, win), behavior: behavior() });
  });
  next.addEventListener("click", () => {
    refreshPort();
    scrollport.scrollBy({ left: measureStep(root, scrollport, win), behavior: behavior() });
  });

  const onScroll = () => update(root, prev, next, scrollport);
  scrollport.addEventListener("scroll", onScroll, { passive: true });
  const flow = root.querySelector(".scrolling-item-cards__flow");
  const track = root.querySelector(".scrolling-item-cards__track");
  if (flow && flow !== scrollport) flow.addEventListener("scroll", onScroll, { passive: true });
  if (track && track !== scrollport) track.addEventListener("scroll", onScroll, { passive: true });

  win.addEventListener("resize", sync);
  if (typeof win.ResizeObserver === "function") {
    const ro = new win.ResizeObserver(sync);
    if (flow) ro.observe(flow);
    if (track) ro.observe(track);
  }

  sync();
}
