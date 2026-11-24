import type { ClassValue } from "clsx";
import type { ButtonPopup, ButtonRadius, ButtonSize, ButtonVariant } from "../types";

export declare const BUTTON_VARIANTS: readonly ButtonVariant[];
export declare const BUTTON_SIZES: readonly ButtonSize[];
export declare const BUTTON_RADII: readonly ButtonRadius[];

export interface ResolveButtonOptions {
  variant?: ButtonVariant | false | null;
  size?: ButtonSize | false | null;
  radius?: ButtonRadius | false | null;
  /** Shorthand for `radius: "full"`. An explicit `radius` wins. */
  pill?: boolean;
  iconOnly?: boolean;
  /** Extra classes, merged after the component's own. */
  className?: ClassValue;
  /** The BEM block. @default "button" */
  block?: string;
  /**
   * What the caller passed besides the options above: `href`, `type`, `disabled`, `aria-*`, `data-*`.
   * `aria-expanded` may be a boolean or "true" | "false", `aria-haspopup` a boolean or a popup kind,
   * `aria-controls` an id (several, space-separated).
   */
  attrs?: Record<string, unknown> & {
    "aria-expanded"?: boolean | "true" | "false";
    "aria-haspopup"?: ButtonPopup | "true" | "false";
    "aria-controls"?: string;
  };
}

export interface ResolvedButton {
  /** `a` when `href` is given, otherwise `button`. */
  tag: "a" | "button";
  className: string;
  /** Spread these on the element: the caller's attributes with the resolver's decisions applied. */
  attrs: Record<string, unknown>;
}

/** Validates a button's options and returns the element, classes and attributes to print. Throws on a bad value. */
export declare function resolveButton(options?: ResolveButtonOptions): ResolvedButton;
