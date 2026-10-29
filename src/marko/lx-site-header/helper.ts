import { resolveSiteHeader } from "../../utils/site-header.js"
import type { ResolvedSiteHeader } from "../../utils/site-header.js"
import type { FooterLink } from "../../types"

export interface Model extends ResolvedSiteHeader {
  siteTitle: string
  homeHref: string
  ctaHref: string
  hideOnScroll: boolean
}

export interface ModelInput {
  /** Menu links, in order. @default Buy, Services, Reviews, About */
  links?: FooterLink[]
  /** Wordmark text. @default "Luxoticars" */
  siteTitle?: string
  /** Where the wordmark links. @default "/" */
  homeHref?: string
  /** Label of the call-to-action button. Below 30rem only its first word shows on desktop; always on mobile. @default "Advertise your car" */
  ctaLabel?: string
  /** Where the call-to-action button goes. @default "https://dash.luxoticars.com" */
  ctaHref?: string
  /**
   * Slide the sticky bar up out of view while the page scrolls down, and back
   * on scrolling up. It stays while its menu is open or it has focus, and
   * never moves under reduced motion. Pure CSS where the browser has
   * `scroll-state(scrolled)` queries; a small script elsewhere. Needs the
   * opt-in stylesheet `@luxoticars/ui/marko/lx-site-header/hide-on-scroll.css`,
   * which no entry imports; without it the bar stays put. @default true
   */
  hideOnScroll?: boolean
}

/** Pure and synchronous: what the bar prints, decided once for every entry. */
export function buildModel(input: ModelInput): Model {
  return {
    ...resolveSiteHeader({ links: input.links, ctaLabel: input.ctaLabel }),
    siteTitle: input.siteTitle ?? "Luxoticars",
    homeHref: input.homeHref ?? "/",
    ctaHref: input.ctaHref ?? "https://dash.luxoticars.com",
    hideOnScroll: input.hideOnScroll ?? true,
  }
}
