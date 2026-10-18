/**
 * Wires a site header's phone menu: tap outside, Escape, tabbing out and
 * choosing a link close it. Every listener is removed when `signal` aborts.
 */
export declare function wireSiteMenu(menu: HTMLDetailsElement, signal: AbortSignal): void;

/**
 * Closes the menu when a resize brings the links back into the bar. Returns
 * that check, for callers that change the bar's layout themselves. Not needed
 * by a header with no links in its bar (the phone header). The listener is
 * removed when `signal` aborts.
 */
export declare function closeMenuWhenLinksShow(
  menu: HTMLDetailsElement,
  nav: Element | null,
  signal: AbortSignal,
): () => void;
