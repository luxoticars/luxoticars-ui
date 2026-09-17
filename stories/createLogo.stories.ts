import { createLogo } from "../src/html/logo";
import type { LogoOptions } from "../src/html/logo";
/*
  The builder ships markup only, so the story loads the stylesheet the way a
  consumer would (`@luxoticars/ui/styles/logo.css`). Without it the canvas shows
  unstyled markup.
*/
import "../src/styles/logo.css";

/**
 * `createLogo` is a plain string builder with no Astro involved, so stories can
 * drive it directly from args.
 *
 * It is the HTML twin of `Logo`: same options, same markup, same stylesheet.
 * Compare the two stories side by side — any visible difference between them is
 * a bug in one of the pair.
 *
 * `createFooter` calls this for its built-in wordmark, the way `Footer.astro`
 * renders `<Logo />` for the same slot.
 */
export default {
  title: "HTML/createLogo",
  tags: ["autodocs"],
  render: (args: LogoOptions) => {
    const host = document.createElement("div");
    /* The wordmark is white, so it is invisible on Storybook's default canvas.
       The footer it normally sits in supplies the dark backdrop. */
    host.style.cssText = "background:oklch(0.145 0 0);padding:2rem";
    host.innerHTML = createLogo(args);
    return host;
  },
  argTypes: {
    siteTitle: { control: "text" },
    href: { control: "text" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Returns the wordmark as an HTML string. The markup carries no Tailwind " +
          "classes; it is styled by `@luxoticars/ui/styles/logo.css`, the same " +
          "stylesheet the Astro component uses, which the caller has to load.",
      },
    },
  },
};

/** Shipped defaults, no configuration at all — identical to `Logo`. */
export const Default = {};

/** A different wordmark and home link. */
export const CustomTitle = {
  args: { siteTitle: "Acme Motors", href: "/home" },
};

/**
 * Both values are escaped on the way into the markup, so caller data cannot
 * close a tag or open an attribute. The title below renders as text.
 */
export const EscapesContent = {
  args: { siteTitle: 'Luxoti"cars<script>', href: '/?q="><b>' },
};
