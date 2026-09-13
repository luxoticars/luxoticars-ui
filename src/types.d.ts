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
