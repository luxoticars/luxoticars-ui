/*
  What a site header prints, decided once for `astro/SiteHeader.astro` and
  the two Marko headers (`marko/site-header-desktop.marko` and
  `marko/site-header-mobile.marko`), so the renderers cannot drift: the default
  links, the new-tab attributes of an external link, and how the
  call-to-action label splits (below 30rem only its first word shows).
*/

export const SITE_HEADER_LINKS = Object.freeze([
  Object.freeze({ label: "Buy", href: "/search" }),
  Object.freeze({ label: "Reviews", href: "/a/reviews/" }),
  Object.freeze({ label: "About", href: "/a/" }),
]);

export function resolveSiteHeader({ links = SITE_HEADER_LINKS, ctaLabel = "Advertise your car" } = {}) {
  const [ctaFirst = "", ...ctaRest] = ctaLabel.trim().split(/\s+/);
  return {
    links: links.map((link) => ({
      ...link,
      ...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
    })),
    // No label, no button: an empty pill would be a link with no name.
    cta: ctaFirst
      ? {
          first: ctaFirst,
          rest: ctaRest.length > 0 ? ` ${ctaRest.join(" ")}` : "",
          // The full label as the name: on small phones the rest is display:none.
          label: ctaRest.length > 0 ? ctaLabel.trim() : undefined,
        }
      : null,
  };
}
