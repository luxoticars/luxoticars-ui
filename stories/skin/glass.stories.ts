/*
  A stylesheet, not a component: the story writes the markup a consumer would
  and loads `@luxoticars/ui/styles/skin/glass.css`, over busy content so the
  blur has something to show.
*/
import "../../src/styles/tokens.css";
import "../../src/styles/skin/glass.css";

type Args = { theme: "light" | "dark" };

const glassMarkup = `<div class="glass" style="border-radius:1rem;padding:0.75rem 1rem">
  Unsaved changes
</div>`;

const glassSource = `<!-- once, in your app entry or layout:
     import "@luxoticars/ui/styles/tokens.css";
     import "@luxoticars/ui/styles/skin/glass.css"; -->
${glassMarkup}`;

/** A page of text with a floating glass bar stuck to its bottom. */
const render = ({ theme }: Args) => {
  const host = document.createElement("div");
  host.dataset.theme = theme;
  host.style.cssText =
    "position:relative;height:16rem;overflow:auto;padding:1.5rem;background:var(--lux-base-100);color:var(--lux-base-content);font:16px/1.5 system-ui";

  for (let i = 0; i < 12; i++) {
    const p = document.createElement("p");
    p.style.margin = "0 0 0.75rem";
    p.textContent = "Business address · Registration no. · Business location · Handler · Profile photo";
    host.append(p);
  }

  const bar = document.createElement("div");
  bar.className = "glass";
  bar.style.cssText =
    "position:sticky;bottom:0.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;border-radius:1rem;padding:0.5rem 0.5rem 0.5rem 1rem";
  const label = document.createElement("span");
  label.textContent = "Unsaved changes";
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Save";
  button.style.cssText =
    "min-height:2.5rem;padding:0 1.25rem;border:0;border-radius:0.5rem;background:var(--lux-primary);color:var(--lux-primary-content);font:inherit;font-weight:600";
  bar.append(label, button);
  host.append(bar);
  return host;
};

/**
 * `glass` is a frosted surface for UI that floats over content, such as a
 * sticky action bar. Put the class on the floating element and give it its
 * own padding and radius; the tint follows the nearest `[data-theme]`.
 *
 * ```html
 * <div class="glass" style="border-radius:1rem;padding:0.75rem 1rem">…</div>
 * ```
 */
export default {
  title: "Skin/glass",
  tags: ["autodocs"],
  render,
  argTypes: { theme: { control: "inline-radio", options: ["light", "dark"] } },
};

export const Light = {
  args: { theme: "light" },
  parameters: { docs: { source: { language: "html", code: glassSource } } },
};

export const Dark = {
  args: { theme: "dark" },
  parameters: { docs: { source: { language: "html", code: glassSource } } },
};
