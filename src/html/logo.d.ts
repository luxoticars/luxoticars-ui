/**
 * Options for {@link createLogo}. Every field mirrors the matching prop on
 * `astro/Logo.astro`, so the two APIs are configured the same way.
 */
export interface LogoOptions {
  /** Wordmark text. @default "Luxoticars" */
  siteTitle?: string;
  /** Where the wordmark links. @default "/" */
  href?: string;
}

/**
 * Returns the Luxoticars wordmark as an HTML string, for contexts that render
 * markup without Astro.
 *
 * Like `createFooter` and unlike `createButton`, this markup carries no Tailwind
 * classes — it is styled by the stylesheet it shares with the Astro component,
 * which the caller loads:
 *
 * ```js
 * import "@luxoticars/ui/styles/logo.css";
 * ```
 *
 * `createFooter` loads no stylesheet on your behalf either, so a footer left
 * with its built-in wordmark needs both that import and `styles/footer.css`.
 *
 * Every value is HTML-escaped on the way into the markup.
 *
 * Plain JS with a hand-written .d.ts rather than TypeScript, because the
 * package ships unbuilt — the same reason `utils/cn` is written that way.
 */
export declare function createLogo(options?: LogoOptions): string;
