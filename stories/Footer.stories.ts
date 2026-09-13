import Footer from "../src/astro/Footer.astro";
import type { FooterLink } from "../src/types";

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
