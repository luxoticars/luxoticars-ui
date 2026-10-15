import SiteHeader from "../src/astro/SiteHeader.astro";
/*
  The header's styles reach it through a frontmatter import, which the
  Storybook framework does not follow for prerendered stories, so they are
  imported here as well, with the logo's.
*/
import "../src/styles/site-header.css";
import "../src/styles/logo.css";
import "./site-header-demo.css";

export default {
  title: "Components/SiteHeader",
  component: SiteHeader,
  tags: ["autodocs"],
  argTypes: {
    slots: { table: { disable: true } },
  },
};

/** No search: the menu always shows beside the wordmark. On phones it opens from the menu button. */
export const WithoutSearch = {
  args: {},
};

/** With a search field in the `search` slot. Below 75rem the search takes the menu's place. */
export const WithSearch = {
  args: {
    slots: {
      search: "<span>Search inventory</span>",
    },
  },
};
