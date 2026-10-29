/**
 * True when the header has `data-hide-on-scroll`, set to anything but "false".
 */
export declare function hideOnScrollEnabled(header: HTMLElement): boolean;

/**
 * Hides a sticky site header while the page scrolls down and shows it again on
 * scrolling up, by setting `data-scroll-dir="down"|"up"` on it for the
 * stylesheet. Does nothing unless the header has `data-hide-on-scroll`. The
 * listener and the attribute are removed when `signal` aborts. Runs even where
 * `@container scroll-state(scrolled: bottom)` also hides the bar: that query
 * is progressive enhancement, not a signal to skip this script.
 */
export declare function wireHideOnScroll(header: HTMLElement, signal: AbortSignal): void;
