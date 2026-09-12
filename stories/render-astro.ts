/**
 * Mounts a pre-rendered Astro variant. The HTML and CSS come from the
 * `astro-stories` Vite plugin, which renders them with Astro's own pipeline in
 * Node; see `.storybook/astro-stories.ts` for why that indirection exists.
 */
export function renderAstro(css: string, html: string, styleId: string) {
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = css;
    document.head.append(style);
  }
  const host = document.createElement("div");
  host.innerHTML = html;
  return host;
}
