/*
  The site header's hide-on-scroll, shared by `astro/SiteHeader.astro` and the
  Marko header. Scrolling down slides the sticky bar up out of view; scrolling
  up brings it back. The stylesheet does the sliding.

  This script always records the last scroll direction on the header as
  `data-scroll-dir="down"|"up"` when hide-on-scroll is on. The opt-in
  stylesheet reads that attribute. `@container scroll-state(scrolled: bottom)`
  is progressive enhancement where the browser actually applies it, and is not
  a reason to skip this script: `scroll-state(scrolled: none)` can match
  without the direction query ever hiding the bar.
*/

/** Scrolls shorter than this, in px, change nothing: no flicker on a jittery trackpad. */
const THRESHOLD = 12;

/** Off unless the header has `data-hide-on-scroll` set to anything but "false". */
export function hideOnScrollEnabled(header) {
  const value = header.getAttribute("data-hide-on-scroll");
  return value !== null && value !== "false";
}

/**
 * Tracks the scroll direction onto `header` until `signal` aborts. A no-op when
 * hide-on-scroll is off.
 * @param {HTMLElement} header
 * @param {AbortSignal} signal
 */
export function wireHideOnScroll(header, signal) {
  if (!hideOnScrollEnabled(header)) return;

  let last = Math.max(0, window.scrollY);
  const onScroll = () => {
    // iOS overscrolls past the top into negative offsets; treat that as the top.
    const y = Math.max(0, window.scrollY);
    if (Math.abs(y - last) < THRESHOLD) return;
    // Within the bar's own height of the top there is nothing to make room
    // for, so it stays; this also brings it back on a jump to the top.
    const dir = y > last && y > header.offsetHeight ? "down" : "up";
    last = y;
    if (header.dataset.scrollDir !== dir) header.dataset.scrollDir = dir;
  };
  window.addEventListener("scroll", onScroll, { passive: true, signal });
  signal.addEventListener("abort", () => header.removeAttribute("data-scroll-dir"), { once: true });
}
