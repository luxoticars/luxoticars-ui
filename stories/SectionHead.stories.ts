import SectionHead from "../src/astro/SectionHead.astro";
/* Imported here too: prerendered stories do not follow the frontmatter import. */
import "../src/styles/section-head.css";
import "./section-head-demo.css";

export default {
  title: "Components/SectionHead",
  component: SectionHead,
  tags: ["autodocs"],
  argTypes: {
    tone: { control: "inline-radio", options: ["light", "dark"] },
    slots: { table: { disable: true } },
  },
};

/** A section title with a "View all" link on the right. */
export const WithLink = {
  args: { title: "Just listed", linkHref: "/search?sort=newest", linkLabel: "View all" },
};

/** On the dark neutral background, with an intro line in the default slot. */
export const Dark = {
  args: {
    title: "Fuelled by passion",
    tone: "dark",
    slots: { default: "<p>From rare hypercars to bespoke classics.</p>" },
  },
};
