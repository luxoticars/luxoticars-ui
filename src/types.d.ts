/** A single navigational link in a footer column or the legal bar. */
export interface FooterLink {
  label: string;
  href: string;
  /** Open in a new tab. A visually hidden "(opens in a new tab)" note is added. */
  external?: boolean;
}

/** A social profile. `path` is the `d` attribute of a single 24x24 SVG path. */
export interface FooterSocial {
  label: string;
  href: string;
  path: string;
}

/** Built-in contact icons. */
export type FooterContactIcon = "email" | "whatsapp";

/** A contact affordance in the Enquiries column. */
export interface FooterContact {
  label: string;
  href: string;
  icon: FooterContactIcon;
  external?: boolean;
}

/** Which kind of dialog: a centred content modal, a forced choice, or a side sheet. */
export type DialogVariant = "lightbox" | "confirm" | "panel";

/** Lightbox width/height preset. `default` is 616px wide. */
export type DialogSize = "narrow" | "default" | "wide" | "large" | "fullscreen";

/** The edge a panel is attached to, in the writing direction. */
export type DialogSide = "start" | "end";

/**
 * What may dismiss the dialog, mapped onto `closedby`: `any` — Escape and a
 * backdrop click; `closerequest` — Escape only; `none` — neither.
 */
export type DialogDismiss = "any" | "closerequest" | "none";

/** A built-in program badge icon. */
export type ProgramBadgeIcon = "top-rated-seller" | "blue-tick" | "star" | "verified" | "pin";

/** Program badge size in px. Sets the icon box, the text size and the gap. */
export type ProgramBadgeSize = 16 | 24;

/** Seller summary size: `full` is a card with every fact, `compact` is one line. */
export type SellerSummarySize = "full" | "compact";

/** The seller summary's built-in text, each replaceable through its `labels` prop. */
export interface SellerSummaryLabels {
  /** The full card's heading. */
  heading: string;
  /** Spoken before the name in the compact size. */
  seller: string;
  luxoticarsVerified: string;
  identityVerified: string;
  carsForSale: string;
  location: string;
  registrationNo: string;
  address: string;
  /** The full card's link to the seller's page. */
  showroom: string;
}

/** What a menu button's items do: none (plain actions), toggle independently, or pick one. */
export type MenuButtonType = "checkbox" | "radio";

/** Which edge of the button the menu lines up with. */
export type MenuButtonAlign = "start" | "end";

/** One entry in a menu button. */
export interface MenuButtonItem {
  /** The visible text, and the item's accessible name. */
  label: string;
  /** Reported when the item is chosen. Required, and unique, in a `checkbox` or `radio` menu. */
  value?: string;
  /** Whether the item is checked. Only in a `checkbox` or `radio` menu. */
  checked?: boolean;
  /**
   * For the "Any" item of a filter, in a `checkbox` menu. Choosing it unchecks every other item, and it
   * cannot be unchecked directly. Choosing any other item unchecks it, and unchecking the last other
   * item checks it again, so the filter is never empty. At most one item.
   */
  exclusive?: boolean;
  disabled?: boolean;
  /** Makes the item a link. Only in a plain menu. */
  href?: string;
  /** A count or short text in a pill after the label, e.g. `3` or `99+`. `0` is shown. */
  badge?: number | string | false;
  /**
   * What screen readers hear for the badge, e.g. "99 new messages". The badge itself is
   * hidden from them. Without it they hear the badge text on its own, which is rarely enough.
   */
  badgeLabel?: string;
  /** A short symbol or text before the label, e.g. `RM`. Decorative unless `prefixLabel` is set. */
  prefix?: string;
  /** What screen readers hear for the prefix. */
  prefixLabel?: string;
}

/**
 * A button's visual treatment. `default` and `secondary` are solid fills; the
 * four status variants are tints that use the status colour as text.
 */
export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "success"
  | "warning"
  | "info";

/** A button's height, padding, type scale and icon size. */
export type ButtonSize = "xs" | "sm" | "default" | "lg" | "xl";

/**
 * A button's corner radius. `field` follows the theme's `--radius-field`; the
 * rest are fixed steps (0.25, 0.375, 0.5, 0.75 and 1rem; `full` is a pill).
 */
export type ButtonRadius = "field" | "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";

/** What a button opens, for `aria-haspopup`. `true` means `menu`. */
export type ButtonPopup = boolean | "menu" | "listbox" | "tree" | "grid" | "dialog";

/** How a progress stepper lays out: steps in a row, or stacked. A row stacks by itself in a narrow container. */
export type ProgressStepperOrientation = "horizontal" | "vertical";

/** Where a horizontal stepper puts each step's text: under its marker, or beside it with the line running on after. Vertical steps always sit beside the marker. */
export type ProgressStepperLabelPlacement = "below" | "inline";

/** Where a step stands. `loading` and `error` are the current step waiting, or failed. */
export type ProgressStepperState = "complete" | "current" | "upcoming" | "loading" | "error";

/** One step of a progress stepper. */
export interface ProgressStepperStep {
  /** Names this step's content slot: `id: "payment"` is filled with `slot="content-payment"`. Without it the slot is `content-<index>`, counting from 0. No spaces; unique across the steps. */
  id?: string;
  /** The step's name, e.g. "Details". */
  label: string;
  /** A line under the label, e.g. what went wrong on an `error` step. */
  description?: string;
  /** Overrides the state worked out from `current`: `loading` while the step waits, `error` when it failed. */
  state?: ProgressStepperState;
}
