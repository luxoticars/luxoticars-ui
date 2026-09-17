import { escapeHtml } from "./utils.js";

/*
  The HTML twin of `astro/Logo.astro`. Both render the same markup against the
  same class names, and both are styled by the one stylesheet they share,
  `styles/logo.css` — which a caller of this builder has to load itself:

      import "@luxoticars/ui/styles/logo.css";

  `createFooter` calls this for its built-in wordmark, the way `Footer.astro`
  renders `<Logo />` for the same slot. That is the point of it existing: the
  builder used to carry its own copy of the wordmark markup, which had already
  drifted from the component's.
*/

/* Home link, not a heading — an h1 inside a footer gives every page on the site
   a second level-1 heading after its real one. */
export const createLogo = ({ siteTitle = "Luxoticars", href = "/" } = {}) =>
  `<a href="${escapeHtml(href)}" class="logo">
  <span class="logo__wordmark">${escapeHtml(siteTitle)}<sub class="logo__mark">&copy;</sub></span>
</a>`;
