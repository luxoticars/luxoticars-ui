import type { Variant } from "../.storybook/astro-stories.ts";
import type { FooterLink } from "../src/types";

/**
 * Each entry becomes a Storybook story. Add a case here to put a new footer
 * arrangement in front of a maintainer.
 */
const homepageCompany: FooterLink[] = [
  { label: "About Us", href: "/a/" },
  { label: "Clients", href: "/a/clients" },
  { label: "Car Reviews", href: "/a/reviews" },
];

const variants: Record<string, Variant> = {
  // Shipped defaults, no configuration at all.
  Default: {},

  // How luxoticars-homepage configures it.
  Homepage: {
    props: { companyLinks: homepageCompany },
  },

  // How luxoticars-vi configures it: different heading and legal slugs.
  Vi: {
    props: {
      brandsHeading: "Shop",
      legalLinks: [
        { label: "Privacy Policy", href: "/a/privacy-policy/" },
        { label: "Terms of Services", href: "/a/terms-of-services/" },
      ],
    },
  },

  // A caller-supplied logo replaces the built-in wordmark.
  CustomLogo: {
    slots: {
      logo: '<a href="/" style="font:700 1.5rem/1 system-ui;color:#fff;letter-spacing:.08em">ACME</a>',
    },
  },

  // Socials hidden and a single legal link, to check the layout still balances.
  Minimal: {
    props: {
      socials: [],
      legalLinks: [{ label: "Privacy Policy", href: "/a/privacy-policy/" }],
      tagline: "",
    },
  },

  // Every link opens in a new tab, exercising the visually hidden note.
  ExternalLinks: {
    props: {
      companyLinks: [
        { label: "About Us", href: "https://example.com/about", external: true },
        { label: "Careers", href: "https://jobs.example.com", external: true },
      ],
    },
  },
};

export default variants;
