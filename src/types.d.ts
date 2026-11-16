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
