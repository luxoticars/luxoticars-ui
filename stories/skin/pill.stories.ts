/*
  A stylesheet, not a component: the story writes the markup a consumer would
  and loads `@luxoticars/ui/styles/skin/pill.css` (canonical). The older
  `@luxoticars/ui/styles/pill.css` export still aliases the same file.
*/
import "../../src/styles/skin/pill.css";

type Args = { size: "default" | "sm" };

/** The markup a consumer writes; `render` and Show code both use it, so they cannot drift. */
const pillMarkup = (size: Args["size"]) => {
  const sm = size === "sm" ? " pill--sm" : "";
  return `<a class="pill${sm}" href="#">Coupe</a>
<a class="pill${sm}" href="#" aria-current="true">SUV</a>
<a class="pill${sm}" href="#">Sedan</a>
<a class="pill${sm} pill--selected" href="#" aria-label="Remove condition Used">Used ×</a>`;
};

/**
 * Show code for one size: the stylesheet import, then the markup. Static per
 * story; changing the `size` control on the docs page does not rewrite it.
 */
const pillSource = (size: Args["size"]) =>
  `<!-- once, in your app entry or layout:
     import "@luxoticars/ui/styles/skin/pill.css"; -->
${pillMarkup(size)}`;

/**
 * `pill` is a rounded link for one choice. Put the classes on an `<a>` (or a
 * `<button>`); mark the current choice with `aria-current="true"`, or with
 * `pill--selected` when aria-current would mean the wrong thing (a link that
 * removes the filter it shows).
 *
 * ```html
 * <a class="pill" href="/search?car_type=suv">SUV</a>
 * <a class="pill pill--sm" href="…" aria-current="true">Used</a>
 * ```
 */
export default {
  title: "Skin/pill",
  tags: ["autodocs"],
  render: ({ size }: Args) => {
    const host = document.createElement("div");
    host.style.cssText = "display:flex;flex-wrap:wrap;gap:0.5rem;padding:2rem";
    host.innerHTML = pillMarkup(size);
    return host;
  },
  argTypes: { size: { control: "inline-radio", options: ["default", "sm"] } },
};

/** 44px tall: the home page's body-type row. */
export const Default = {
  args: { size: "default" },
  parameters: { docs: { source: { language: "html", code: pillSource("default") } } },
};

/** 32px: a panel of many choices, such as the search filters. */
export const Small = {
  args: { size: "sm" },
  parameters: { docs: { source: { language: "html", code: pillSource("sm") } } },
};
