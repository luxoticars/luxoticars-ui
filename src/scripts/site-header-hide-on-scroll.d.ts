/**
 * True when the header has `data-hide-on-scroll`, set to anything but "false".
 */
export declare function hideOnScrollEnabled(header: HTMLElement): boolean;

/**
 * Hides a sticky site header while the page scrolls down and shows it again on
 * scrolling up, by setting `data-scroll-dir="down"|"up"` on it for the
 * stylesheet. Does nothing unless the header has `data-hide-on-scroll`, or
 * where the stylesheet's `@container scroll-state(scrolled)` query already does
 * the job (checked once). The listener and the attribute are removed when
 * `signal` aborts.
 */
export declare function wireHideOnScroll(header: HTMLElement, signal: AbortSignal): void;

/** Forgets the cached support check. Tests only. */
export declare function resetHideOnScrollSupport(): void;
