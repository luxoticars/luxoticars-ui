import MenuButtonDemo from "./MenuButtonDemo.astro";
import { cases } from "../menu-button-cases";
import {
  checkBadges,
  checkBusyState,
  checkCheckboxes,
  checkChevron,
  checkExclusive,
  checkFocusLeaves,
  checkNavigation,
  checkOutsideFocusAfterPress,
  checkOpenAndClose,
  checkRadios,
  checkSemantics,
  parts,
} from "../menu-button-play";
import { initMenuButton, setMenuButtonBusy } from "../../src/scripts/menu-button.js";
/*
  Astro components are prerendered to markup by the Storybook framework, so
  the stylesheet reaches the story as a module here, as it does for ProgramBadge.
*/
import "../../src/styles/skin/menu-button.css";

const BLOCK = "menu-button";
type Ctx = { canvasElement: HTMLElement };

/*
  The Astro Storybook dev renderer does not execute component scripts, so each
  story installs the behaviour itself, as the ScrollingItemCards stories do.
*/
const wired = async (canvasElement: HTMLElement) => {
  initMenuButton(parts(canvasElement, BLOCK).root);
};

/**
 * A button that opens a menu: the WAI-ARIA menu button pattern. Items can be plain
 * actions or links, checkboxes or radios, and can carry a `badge` and a `prefix`.
 *
 * ```astro
 * ---
 * import MenuButton from "@luxoticars/ui/astro/ui/MenuButton";
 * ---
 * <MenuButton label="Condition" type="checkbox" items={[
 *   { value: "any", label: "Any Condition", checked: true },
 *   { value: "used", label: "Used" },
 * ]} />
 * ```
 */
export default {
  title: "Components/MenuButton",
  component: MenuButtonDemo,
  tags: ["autodocs"],
  parameters: {
    docs: {
      story: { height: "420px" },
      description: {
        component: `## What it costs

Measured on the built component: minified with esbuild, compressed at gzip level 9 and default brotli.

| What you pay | Raw | gzip | brotli |
| --- | --- | --- | --- |
| CSS, once per page (\`menu-button.css\`) | 5,476 B | 1,556 B | 1,308 B |
| JS, once per page (\`scripts/menu-button.js\`, no dependencies) | 3,385 B | 1,461 B | 1,293 B |
| HTML per instance, the 4-item Condition filter | about 2.2 kB | about 540 B | |
| Marko tag, client code (\`<lx-menu-button>\`, besides the Marko runtime) | 13,550 B | 5,228 B | 4,698 B |

The Astro component ships the CSS and JS above and no framework. The Marko tag has its own stylesheet (5,280 B raw, 1,440 B gzip) and keeps its state in the tag, so its client code is larger; it resolves on the client, which is why it uses \`clsx\` and not \`cn()\`: \`cn()\` would add 8.5 kB gzip of \`tailwind-merge\`.

The waiting state adds about 135 B gzip of CSS, two small elements per instance (about 110 B of HTML), and, only if you import \`setMenuButtonBusy\`, about 93 B gzip of JS (1,554 B gzip in all).

Each extra item costs about 200 B of HTML (about 40 B gzipped); a badge adds about 70 B; a prefix about 70 B. No images, no icon font: the chevron and check are inline SVG paths.`,
      },
    },
  },
};

export const Condition = {
  args: cases.Condition,
  play: async ({ canvasElement }: Ctx) => {
    await wired(canvasElement);
    await checkSemantics(canvasElement, BLOCK);
    await checkChevron(canvasElement, BLOCK);
    await checkOpenAndClose(canvasElement, BLOCK);
    await checkNavigation(canvasElement, BLOCK);
    await checkCheckboxes(canvasElement, BLOCK);
    await checkExclusive(canvasElement, BLOCK);
    await checkFocusLeaves(canvasElement, BLOCK);
    await checkOutsideFocusAfterPress(canvasElement, BLOCK);
  },
};

export const Badged = {
  args: cases.Badged,
  play: async ({ canvasElement }: Ctx) => {
    await wired(canvasElement);
    await checkSemantics(canvasElement, BLOCK);
    await checkBadges(canvasElement, BLOCK);
    await checkOpenAndClose(canvasElement, BLOCK);
  },
};

export const CheckboxWithBadges = {
  args: cases.CheckboxWithBadges,
  play: async ({ canvasElement }: Ctx) => {
    await wired(canvasElement);
    await checkBadges(canvasElement, BLOCK);
    await checkCheckboxes(canvasElement, BLOCK);
  },
};

export const Radio = {
  args: cases.Radio,
  play: async ({ canvasElement }: Ctx) => {
    await wired(canvasElement);
    await checkRadios(canvasElement, BLOCK);
  },
};

export const Prefix = {
  args: cases.Prefix,
  play: async ({ canvasElement }: Ctx) => {
    await wired(canvasElement);
    await checkRadios(canvasElement, BLOCK);
  },
};

export const Links = {
  args: cases.Links,
  play: async ({ canvasElement }: Ctx) => {
    await wired(canvasElement);
    await checkSemantics(canvasElement, BLOCK);
    const { items } = parts(canvasElement, BLOCK);
    if (!items.every((i) => i.tagName === "A" && i.getAttribute("role") === "menuitem" && i.getAttribute("href"))) {
      throw new Error("link items are <a role=menuitem href>");
    }
  },
};

export const WithDisabledItem = {
  args: cases.WithDisabledItem,
  play: async ({ canvasElement }: Ctx) => {
    await wired(canvasElement);
    await checkNavigation(canvasElement, BLOCK);
  },
};

export const InAForm = {
  args: cases.InAForm,
  play: async ({ canvasElement }: Ctx) => {
    await wired(canvasElement);
    const { button, items } = parts(canvasElement, BLOCK);
    const fields = () => [...canvasElement.querySelectorAll<HTMLInputElement>("input[type=hidden]")].filter((f) => !f.disabled).map((f) => f.value);
    if (fields().join() !== "used") throw new Error(`only the checked item submits, got ${fields().join()}`);
    button.click();
    items[0].click();
    if (fields().join() !== "new,used") throw new Error(`a newly checked item submits too, got ${fields().join()}`);
  },
};

/**
 * Waiting for something the menu started. `busy` is the prop; from a script, `setMenuButtonBusy(root, true,
 * "Updating results…")` does the same to a menu that is already on the page.
 */
export const Busy = {
  args: cases.Busy,
  play: async ({ canvasElement }: Ctx) => {
    await wired(canvasElement);
    const { root } = parts(canvasElement, BLOCK);
    await checkBusyState(canvasElement, BLOCK, "Updating results…");
    setMenuButtonBusy(root, false);
    await checkBusyState(canvasElement, BLOCK, null);
    setMenuButtonBusy(root, true);
    await checkBusyState(canvasElement, BLOCK, "Loading");
    setMenuButtonBusy(root, true, "Updating results…");
    await checkBusyState(canvasElement, BLOCK, "Updating results…");
  },
};

export const AlignEnd = { args: cases.AlignEnd };
