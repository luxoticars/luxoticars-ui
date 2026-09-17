import Footer from "../src/astro/Footer.astro";
import type { FooterLink } from "../src/types";
/*
  Astro components are prerendered to markup by the Storybook framework, and a
  component's `<style>` block is injected as its literal source text — an
  `@import` inside one resolves against the page URL and 404s, so a shared
  stylesheet has to reach the story as a module, the way a consuming app's
  bundler reaches it from the component's frontmatter import.
*/
import "../src/styles/footer.css";
/* The footer falls back to `<Logo />` for its wordmark, which is its own block. */
import "../src/styles/logo.css";
/*
  The component's styles live in a stylesheet it shares with `createFooter`, and
  it reaches them through an `@import` in its scoped `<style>`. Astro resolves
  that import; @storybook-astro/framework does not — it lifts the text of the
  `<style>` block into the preview verbatim and only ever follows `.astro`
  imports. So the stylesheet is imported here as well, which is what actually
  styles this story.

  The lifted `@import` still resolves against the preview iframe's URL and 404s
  there. It is inert — the bundled import above has already applied the same
  rules — but it is why the console shows a missing `/styles/footer.css` on
  these stories. Storybook-only: an app using the component gets the stylesheet
  from Astro's build, correctly scoped.
*/
import "../src/styles/footer.css";

const homepageCompany: FooterLink[] = [
  { label: "About Us", href: "/a/" },
  { label: "Clients", href: "/a/clients" },
  { label: "Car Reviews", href: "/a/reviews" },
];

export default {
  title: "Components/Footer",
  component: Footer,
  tags: ["autodocs"],
  argTypes: {
    slots: { table: { disable: true } },
  },
};

/** Shipped defaults, no configuration at all. */
export const Default = {};

/** How luxoticars-homepage configures it. */
export const Homepage = {
  args: { companyLinks: homepageCompany },
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

/** A caller-supplied logo replaces the built-in wordmark. */
export const CustomLogo = {
  args: {
    slots: {
      logo: '<a href="/" style="font:700 1.5rem/1 system-ui;color:#fff;letter-spacing:.08em">ACME</a>',
    },
  },
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

/** Narrow viewport, where the columns stack. */
export const Mobile = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
