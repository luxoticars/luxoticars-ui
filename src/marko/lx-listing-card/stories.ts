import type { Meta, StoryObj } from "@storybook/marko";
import ListingCard, { type Input } from "./index.marko";
import StoryCard, { type Input as StoryInput } from "./story-card.stories.marko";
import { assertListingCardTree, cases, type ListingCardCase } from "../../../stories/listing-card-cases";

/**
 * `<lx-listing-card>` for Marko 6 apps. Discovered through marko.json:
 *
 * ```marko
 * lx-listing-card href="/m/abc/" headingId="listing-card-1"
 *   @media
 *     img.listing-card__image src="/m/abc/cover/" alt="" width="640" height="480" loading="lazy" decoding="async"
 *   @kicker -- 2021 · Land Rover
 *   @title -- Range Rover Vogue
 *   @price -- MYR 450,000
 * ```
 *
 * Cases are shared with the Astro stories (`stories/listing-card-cases.ts`).
 * Storybook args cannot pass an AttrTag body — a string `content` is read as a
 * tag name — so each story renders `story-card.stories.marko`, which turns the
 * case HTML into real `@title` / `@price` / … bodies.
 */
export default {
  title: "Components/listing-card",
  component: ListingCard,
  tags: ["autodocs"],
  argTypes: {
    href: { control: "text", description: "Required. Target of the stretched title link." },
    headingLevel: {
      control: "inline-radio",
      options: [2, 3],
      description: "`2` or `3`.",
      table: { defaultValue: { summary: "2" } },
    },
    headingId: { control: "text", description: "Optional id on the heading." },
    linkLabel: { control: "text", description: "Optional aria-label on the stretched link." },
  },
} satisfies Meta<Input>;

type Story = StoryObj<StoryInput>;

const play =
  (name: keyof typeof cases) =>
  async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    assertListingCardTree(canvasElement, name);
  };

function toArgs(name: keyof typeof cases): StoryInput {
  const c = cases[name] as ListingCardCase;
  return {
    href: c.href,
    headingLevel: c.headingLevel,
    headingId: c.headingId,
    linkLabel: c.linkLabel,
    class: c.class,
    mediaHtml: c.slots.media,
    kickerHtml: c.slots.kicker,
    titleHtml: c.slots.title,
    priceHtml: c.slots.price,
    metaHtml: c.slots.meta,
    locationHtml: c.slots.location,
    actionHtml: c.slots.action,
  };
}

const render = (args: StoryInput) => ({ component: StoryCard, input: args });

export const Default: Story = { args: toArgs("Default"), render, play: play("Default") };
export const NoPhoto: Story = { args: toArgs("NoPhoto"), render, play: play("NoPhoto") };
export const WithKickerMetaLocation: Story = {
  args: toArgs("WithKickerMetaLocation"),
  render,
  play: play("WithKickerMetaLocation"),
};
export const WithAction: Story = { args: toArgs("WithAction"), render, play: play("WithAction") };
export const HeadingLevel3: Story = { args: toArgs("HeadingLevel3"), render, play: play("HeadingLevel3") };
export const PriorityImage: Story = { args: toArgs("PriorityImage"), render, play: play("PriorityImage") };
