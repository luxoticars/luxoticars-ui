import { createFooter } from "../src/html/footer";
import type { FooterOptions } from "../src/html/footer";
/*
  The builder ships markup only, so the story loads the stylesheet the way a
  consumer would (`@luxoticars/ui/styles/footer.css`). Without it the canvas
  shows unstyled markup.
*/
import "../src/styles/footer.css";

const ACME_LOGO =
  '<a href="/" style="font:700 1.5rem/1 system-ui;color:#fff;letter-spacing:.08em">ACME</a>';

/**
 * `createFooter` is a plain string builder with no Astro involved, so stories
 * can drive it directly from args.
 *
 * It is the HTML twin of `Components/Footer`: same options, same markup, same
 * stylesheet. Compare the two stories side by side — any visible difference
 * between them is a bug in one of the pair.
 *
 * Named `createFooter.stories.ts` rather than `Footer.stories.ts` because the
 * Astro component already has that file. (The HTML Button story predates this
 * and is still `Button.stories.ts`.)
 */
export default {
  title: "HTML/createFooter",
  tags: ["autodocs"],
  render: (args: FooterOptions) => {
    const host = document.createElement("div");
    host.innerHTML = createFooter(args);
    return host;
  },
  argTypes: {
    idPrefix: { control: "text" },
    siteTitle: { control: "text" },
    homeHref: { control: "text" },
    logo: { control: "text" },
    tagline: { control: "text" },
    brandsHeading: { control: "text" },
    companyHeading: { control: "text" },
    enquiriesHeading: { control: "text" },
    enquiriesText: { control: "text" },
    copyright: { control: "text" },
    year: { control: "number" },
    className: { control: "text" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Returns the footer as an HTML string. The markup carries no Tailwind " +
          "classes; it is styled by `@luxoticars/ui/styles/footer.css`, the same " +
          "stylesheet the Astro component uses, which the caller has to load.",
      },
    },
  },
};

/** Shipped defaults, no configuration at all — identical to `Components/Footer`. */
export const Default = {};

/** How luxoticars-homepage configures it. */
export const Homepage = {
  args: {
    companyLinks: [
      { label: "About Us", href: "/a/" },
      { label: "Clients", href: "/a/clients" },
      { label: "Car Reviews", href: "/a/reviews" },
    ],
  },
};

/** How luxoticars-vi configures it: different heading and legal slugs. */
export const Vi = {
  args: {
    brandsHeading: "Shop",
    legalLinks: [
      { label: "Privacy Policy", href: "/a/privacy-policy/" },
      { label: "Terms of Services", href: "/a/terms-of-services/" },
    ],
  },
};

/** `logo` is the string-builder stand-in for the component's `logo` slot. */
export const CustomLogo = {
  args: { logo: ACME_LOGO },
};

/** Socials hidden and a single legal link, to check the layout still balances. */
export const Minimal = {
  args: {
    socials: [],
    legalLinks: [{ label: "Privacy Policy", href: "/a/privacy-policy/" }],
    tagline: "",
  },
};

/** Every link opens in a new tab, exercising the visually hidden note. */
export const ExternalLinks = {
  args: {
    companyLinks: [
      { label: "About Us", href: "https://example.com/about", external: true },
      { label: "Careers", href: "https://jobs.example.com", external: true },
    ],
  },
};

/**
 * Labels and hrefs are escaped on the way into the markup, so caller data
 * cannot close a tag or open an attribute. The label below renders as text.
 */
export const EscapesContent = {
  args: {
    siteTitle: 'Luxoti"cars',
    companyLinks: [
      { label: '<script>alert("xss")</script>', href: '/a/?q="><b>' },
      { label: "Tom & Jerry", href: "/a/t&j" },
    ],
  },
};

/** Narrow viewport, where the columns stack. */
export const Mobile = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
