/** Options for {@link createButton}. */
export interface ButtonOptions {
  /**
   * Visible label. Escaped before it is written into the markup.
   * @default "Button"
   */
  label?: string;
  /** The `type` attribute. @default "button" */
  type?: "button" | "submit" | "reset";
  /**
   * `aria-label`, for a button whose visible label is not descriptive on its
   * own (an "×", say). Omitted from the markup when not given.
   */
  ariaLabel?: string;
  /** Extra classes, appended after the built-in ones. @default "" */
  className?: string;
  /** Renders the `disabled` attribute. @default false */
  disabled?: boolean;
}

/**
 * Returns a `<button>` as an HTML string, for contexts that render markup
 * without Astro. The markup carries Tailwind utility classes, so it is only
 * styled in an app that loads Tailwind.
 *
 * Plain JS with a hand-written .d.ts rather than TypeScript, because the
 * package ships unbuilt — the same reason `utils/cn` is written that way.
 */
export declare function createButton(options?: ButtonOptions): string;
