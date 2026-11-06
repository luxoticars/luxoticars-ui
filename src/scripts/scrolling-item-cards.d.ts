/**
 * Progressive enhancement for one `.scrolling-item-cards` root: show prev/next
 * when the active scrollport overflows, `scrollBy` one item, enable/disable at
 * the ends. Call once per root; further calls on the same root are no-ops.
 *
 * `ScrollingItemCards.astro` and `<lx-scrolling-item-cards>` install this
 * themselves.
 */
export declare function initScrollingItemCards(root: Element | null | undefined): void;
