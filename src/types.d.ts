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
export type ProgramBadgeIcon = "top-rated-seller";

/** Program badge size in px. Sets the icon box, the text size and the gap. */
export type ProgramBadgeSize = 16 | 24;
