/*
  The site header's hide-on-scroll, shared by `astro/SiteHeader.astro` and the
  Marko header. Scrolling down slides the sticky bar up out of view; scrolling
  up brings it back. The stylesheet does the sliding.

  Where the browser has `@container scroll-state(scrolled)` (Chrome 144+), the
  stylesheet does it all and this script does nothing. Everywhere else (Safari,
  Firefox, older Chrome) it puts the last scroll direction on the header as
  `data-scroll-dir="down"|"up"`, which the stylesheet reads the same way.

  Support is told by the stylesheet itself: it sets `--_scrolled-query: 1` on
  the header inside a `scroll-state(scrolled)` query that always matches where
  the query is understood. That is read once, on the first header wired.
*/

/** Scrolls shorter than this, in px, change nothing: no flicker on a jittery trackpad. */
const THRESHOLD = 12;

/** @type {boolean | undefined} */
let nativeScrolledQuery;

/** True where the stylesheet hides the bar on its own. Read once. */
function supportsScrolledQuery(header) {
  nativeScrolledQuery ??= getComputedStyle(header).getPropertyValue("--_scrolled-query").trim() === "1";
  return nativeScrolledQuery;
}

/** Off unless the header has `data-hide-on-scroll` set to anything but "false". */
export function hideOnScrollEnabled(header) {
  const value = header.getAttribute("data-hide-on-scroll");
  return value !== null && value !== "false";
}

/**
 * Tracks the scroll direction onto `header` until `signal` aborts. A no-op when
 * hide-on-scroll is off or the stylesheet handles it.
 * @param {HTMLElement} header
 * @param {AbortSignal} signal
 */
export function wireHideOnScroll(header, signal) {
  if (!hideOnScrollEnabled(header) || supportsScrolledQuery(header)) return;

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

/** Forgets the support check. Tests only. */
export function resetHideOnScrollSupport() {
  nativeScrolledQuery = undefined;
}
