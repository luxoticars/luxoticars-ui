import ProgramBadge from "../../src/astro/ui/ProgramBadge.astro";
import { cases } from "../program-badge-cases";
/*
  Astro components are prerendered to markup by the Storybook framework, so
  the stylesheet reaches the story as a module here, as it does for Dialog.
*/
import "../../src/styles/program-badge.css";

/**
 * The cases come from `stories/program-badge-cases.ts`. The Marko stories and
 * the parity test read the same file, so both renderers are shown with the
 * same inputs.
 */
export default {
  title: "Components/ProgramBadge",
  component: ProgramBadge,
  tags: ["autodocs"],
};

export const Default = { args: cases.Default };
export const TextOnly = { args: cases.TextOnly };
export const IconOnly = { args: cases.IconOnly };
export const Large = { args: cases.Large };
export const IconOnlyMalayLabel = { args: cases.IconOnlyMalayLabel };
export const WithAttributes = { args: cases.WithAttributes };

// Astro-only, so not in the shared cases: Marko has no `class:list`.
export const WithClassList = {
  args: { icon: "top-rated-seller", text: "Top rated seller", "class:list": ["extra", { ring: true }] },
};
