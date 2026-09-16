import { escapeHtml, joinClasses } from "./utils.js";
import * as defaults from "../data/footer.js";

/*
  The HTML twin of `astro/Footer.astro`. Both render the same markup against the
  same class names, and both are styled by the one stylesheet they share,
  `styles/footer.css` — which a caller of this builder has to load itself, the
  way a caller of `createButton` has to load Tailwind:

      import "@luxoticars/ui/styles/footer.css";

  The Astro component gets that stylesheet scoped by Astro's build; there is no
  build step here, so it stays a plain global import.
*/

/*
  Kept out of the markup so a caller-supplied contact list can reference an icon
  by name rather than pasting path data. The email mark is stroked, the WhatsApp
  glyph is filled, hence the per-icon stroke flag.

  Same table as the Astro component's, and for the same reason it is a table:
  `contacts` is caller data, so the icon has to be addressable by name.
*/
const contactIcons = {
  email: {
    fill: "none",
    stroke: true,
    paths: ["M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", "m2 7 10 6 10-6"],
  },
  whatsapp: {
    fill: "currentColor",
    stroke: false,
    paths: [
      "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
    ],
  },
};

/* Announced, never seen. The leading space is deliberate: it separates the note
   from the label when a screen reader concatenates the link's text. */
const externalNote = '<span class="footer__sr-only"> (opens in a new tab)</span>';

/* An external link needs both halves — `rel` without `target` is pointless, and
   `target` without `rel` hands the opened page a live `window.opener`. */
const externalAttributes = (external) =>
  external ? ' target="_blank" rel="noopener noreferrer"' : "";

const indent = (markup, spaces) =>
  markup
    .split("\n")
    .map((line) => (line ? " ".repeat(spaces) + line : line))
    .join("\n");

const renderListLink = (link, linkClass) => `<li>
  <a href="${escapeHtml(link.href)}" class="${linkClass}"${externalAttributes(link.external)}>${escapeHtml(link.label)}${link.external ? externalNote : ""}</a>
</li>`;

const renderLinkList = (links, linkClass, listClass) => `<ul class="${listClass}">
${links.map((link) => indent(renderListLink(link, linkClass), 2)).join("\n")}
</ul>`;

const renderSocial = (social, siteTitle) => `<a
  href="${escapeHtml(social.href)}"
  target="_blank"
  rel="noopener noreferrer"
  class="footer__social-link"
  aria-label="${escapeHtml(`${siteTitle} on ${social.label} (opens in a new tab)`)}"
>
  <svg class="footer__social-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="${escapeHtml(social.path)}"></path>
  </svg>
</a>`;

const renderContact = (contact) => {
  /* An unknown icon name drops the glyph rather than throwing: the label and the
     href are the parts that carry meaning, and a footer is not worth a hard
     failure over a typo in one row of caller data. */
  const icon = contactIcons[contact.icon];
  const strokeAttributes = icon?.stroke
    ? ' stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"'
    : "";
  const svg = icon
    ? `<svg class="footer__contact-icon" viewBox="0 0 24 24" fill="${icon.fill}"${strokeAttributes} aria-hidden="true">
    ${icon.paths.map((d) => `<path d="${escapeHtml(d)}"></path>`).join("\n    ")}
  </svg>
  `
    : "";

  return `<a href="${escapeHtml(contact.href)}" class="footer__contact-link"${externalAttributes(contact.external)}>
  ${svg}<span class="footer__link">${escapeHtml(contact.label)}</span>${contact.external ? externalNote : ""}
</a>`;
};

const renderColumn = ({ modifier, headingId, headingClass, heading, body }) => `<div class="footer__column footer__column--${modifier}">
  <span aria-hidden="true" class="footer__column-accent"></span>
  <h2${headingId ? ` id="${escapeHtml(headingId)}"` : ""} class="${headingClass}">${escapeHtml(heading)}</h2>
${indent(body, 2)}
</div>`;

export const createFooter = ({
  idPrefix = "footer",
  siteTitle = "Luxoticars",
  homeHref = "/",
  logo,
  tagline = defaults.tagline,
  brandsHeading = "Shop by Brand",
  brandLinks = defaults.brandLinks,
  companyHeading = "Luxoticars",
  companyLinks = defaults.companyLinks,
  enquiriesHeading = "Enquiries",
  enquiriesText = defaults.enquiriesText,
  contacts = defaults.contacts,
  socials = defaults.socials,
  legalLinks = defaults.legalLinks,
  copyright,
  year = new Date().getFullYear(),
  className = "",
} = {}) => {
  const brandsHeadingId = `${idPrefix}-heading-brands`;
  const companyHeadingId = `${idPrefix}-heading-company`;
  const copyrightLine = copyright ?? `© ${year} ${siteTitle}. All rights reserved.`;

  /* Home link, not a heading — an h1 down here gives every page on the site a
     second level-1 heading after its real one.

     `logo` is the string-builder stand-in for the component's `logo` slot, so it
     is written out as markup rather than escaped. Pass markup you control. */
  const logoMarkup =
    logo ??
    `<a href="${escapeHtml(homeHref)}" class="footer__wordmark-link">
  <span class="footer__wordmark">${escapeHtml(siteTitle)}<sub>&copy;</sub></span>
</a>`;

  const columns = [
    brandLinks.length > 0 &&
      renderColumn({
        modifier: "brands",
        headingId: brandsHeadingId,
        headingClass: "footer__column-heading footer__column-heading--brands",
        heading: brandsHeading,
        body: `<nav aria-labelledby="${escapeHtml(brandsHeadingId)}">
${indent(renderLinkList(brandLinks, "footer__link", "footer__link-list footer__link-list--brands"), 2)}
</nav>`,
      }),
    companyLinks.length > 0 &&
      renderColumn({
        modifier: "company",
        headingId: companyHeadingId,
        headingClass: "footer__column-heading",
        heading: companyHeading,
        body: `<nav aria-labelledby="${escapeHtml(companyHeadingId)}">
${indent(renderLinkList(companyLinks, "footer__link", "footer__link-list"), 2)}
</nav>`,
      }),
    contacts.length > 0 &&
      renderColumn({
        modifier: "enquiries",
        headingId: "",
        headingClass: "footer__column-heading",
        heading: enquiriesHeading,
        body: [
          enquiriesText ? `<p class="footer__enquiries-text">${escapeHtml(enquiriesText)}</p>` : "",
          `<div class="footer__contact-list">
${contacts.map((contact) => indent(renderContact(contact), 2)).join("\n")}
</div>`,
        ]
          .filter(Boolean)
          .join("\n"),
      }),
  ].filter(Boolean);

  const masthead = [
    `<div class="footer__brand">
  <div class="footer__logo-wrap">
${indent(logoMarkup, 4)}
  </div>${tagline ? `\n  <p class="footer__tagline">${escapeHtml(tagline)}</p>` : ""}
</div>`,
    socials.length > 0 &&
      `<nav class="footer__socials" aria-label="${escapeHtml(`${siteTitle} on social media`)}">
${socials.map((social) => indent(renderSocial(social, siteTitle), 2)).join("\n")}
</nav>`,
  ].filter(Boolean);

  const bottom = [
    `<p class="footer__copyright">${escapeHtml(copyrightLine)}</p>`,
    legalLinks.length > 0 &&
      `<nav aria-label="Legal">
${indent(renderLinkList(legalLinks, "footer__link footer__link--small", "footer__legal-list"), 2)}
</nav>`,
  ].filter(Boolean);

  return `<footer class="${joinClasses("footer", escapeHtml(className))}">
  <div aria-hidden="true" class="footer__seam"></div>
  <div class="footer__container">
    <div class="footer__masthead">
${indent(masthead.join("\n"), 6)}
    </div>
    <div aria-hidden="true" class="footer__divider"></div>
    <div class="footer__columns">
${indent(columns.join("\n"), 6)}
    </div>
    <div class="footer__bottom">
${indent(bottom.join("\n"), 6)}
    </div>
  </div>
</footer>`;
};
