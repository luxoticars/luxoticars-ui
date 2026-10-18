/**
 * Wires a site header's phone menu: tap outside, Escape, tabbing out and
 * choosing a link close it, and so does a resize that brings the links back
 * into the bar. Returns that resize check, for callers that change the bar's
 * layout themselves. Every listener is removed when `signal` aborts.
 */
export declare function wireSiteMenu(
  menu: HTMLDetailsElement,
  nav: Element | null,
  signal: AbortSignal,
): () => void;
