/*
  Program badge artwork, drawn for Luxoticars on a 24×24 grid in one colour
  (the badge fills it with `currentColor`). Details are knocked out with
  `fill-rule: evenodd`, so they show whatever surface the badge sits on, in
  either theme, with no second colour.

  Frozen: the paths are shared by every badge a page renders.
  Internal: not in package.json#exports.
*/

const freeze = (paths) => Object.freeze(paths.map((path) => Object.freeze(path)));

export const PROGRAM_BADGE_ICONS = Object.freeze({
  /* A rosette: two ribbon tails behind a round medal with a knocked-out star.
     The tails are their own path, so `evenodd` on the medal cannot cut holes
     where the two overlap. */
  "top-rated-seller": Object.freeze({
    label: "Top rated seller",
    paths: freeze([
      { d: "M8.5 14.8L6.5 22L9.2 20.8L10.8 23L12 16.3ZM15.5 14.8L17.5 22L14.8 20.8L13.2 23L12 16.3Z" },
      {
        d: "M5 9.5a7 7 0 1 0 14 0a7 7 0 1 0-14 0ZM12 5.5L13.03 8.08L15.8 8.26L13.66 10.04L14.35 12.74L12 11.25L9.65 12.74L10.34 10.04L8.2 8.26L10.97 8.08Z",
        fillRule: "evenodd",
      },
    ]),
  }),
  /* A scalloped seal with the tick knocked out, so the tick shows the surface
     like the rosette's star. Scaled from the 16×16 "authenticity guarantee"
     artwork (×1.5) and drawn in one colour: the badge paints it with
     `--lux-primary`, not the artwork's own blue. */
  "blue-tick": Object.freeze({
    label: "Verified",
    paths: freeze([{ d: "M20.486 3.514a4.98 4.98 0 0 1 1.464 3.45c0.011 0.581 0.244 1.146 0.648 1.563C23.466 9.428 24 10.65 24 12c0 1.35 -0.534 2.574 -1.404 3.474a2.321 2.321 0 0 0 -0.646 1.563 4.983 4.983 0 0 1 -1.464 3.449 4.983 4.983 0 0 1 -3.45 1.464 2.322 2.322 0 0 0 -1.561 0.646A4.98 4.98 0 0 1 12 24a4.98 4.98 0 0 1 -3.474 -1.404 2.321 2.321 0 0 0 -1.561 -0.646 4.983 4.983 0 0 1 -3.45 -1.464 4.983 4.983 0 0 1 -1.462 -3.449 2.322 2.322 0 0 0 -0.648 -1.563A4.983 4.983 0 0 1 0 12c0 -1.35 0.535 -2.574 1.404 -3.474 0.404 -0.417 0.637 -0.983 0.648 -1.563 0.021 -1.249 0.51 -2.494 1.462 -3.449a4.983 4.983 0 0 1 3.45 -1.464 2.321 2.321 0 0 0 1.56 -0.646A4.986 4.986 0 0 1 12 0c1.35 0 2.574 0.535 3.474 1.404 0.417 0.404 0.983 0.637 1.563 0.648 1.251 0.021 2.494 0.51 3.45 1.462ZM16.811 8.69a1.5 1.5 0 0 1 0 2.121l-5.25 5.25a1.5 1.5 0 0 1 -2.121 0l-2.25 -2.25a1.5 1.5 0 0 1 2.121 -2.121L10.5 12.879l4.19 -4.19a1.5 1.5 0 0 1 2.121 0Z", fillRule: "evenodd" }]),
  }),
  /* A rounded five-point star, one filled path: the "rating" star, scaled from
     the 14×15 artwork (×1.6) and centred on the 24×24 grid. The badge paints
     it with the accent, like the rosette. */
  star: Object.freeze({
    label: "Star",
    paths: freeze([{ d: "M11.422 19.504L6.41 22.575C5.889 22.894 5.207 22.73 4.888 22.209C4.732 21.955 4.686 21.648 4.759 21.359L5.535 18.305C5.815 17.202 6.57 16.281 7.595 15.789L13.063 13.163C13.318 13.041 13.425 12.735 13.303 12.48C13.204 12.274 12.979 12.158 12.754 12.197L6.667 13.251C5.43 13.465 4.161 13.124 3.199 12.317L1.276 10.706C0.808 10.313 0.746 9.615 1.139 9.147C1.33 8.919 1.604 8.778 1.901 8.754L7.775 8.295C8.19 8.262 8.552 8 8.711 7.615L10.978 2.144C11.212 1.58 11.859 1.312 12.424 1.545C12.695 1.658 12.91 1.873 13.022 2.144L15.289 7.615C15.448 8 15.81 8.262 16.225 8.295L22.132 8.757C22.741 8.805 23.196 9.337 23.148 9.947C23.125 10.24 22.987 10.512 22.763 10.702L18.258 14.543C17.941 14.813 17.803 15.239 17.9 15.644L19.285 21.397C19.428 21.992 19.062 22.589 18.468 22.732C18.183 22.801 17.882 22.753 17.631 22.6L12.578 19.504C12.223 19.287 11.777 19.287 11.422 19.504Z" }]),
  }),
  /* The tick the dealer profile page shows ("Verified by Luxoticars"): a
     scalloped seal with the tick knocked out, taken from luxoticars-user-profile
     (white tick on #1d9bf0 there). The tick is one subpath of the seal's path,
     written with absolute coordinates, since a relative `m` after `Z` would
     start from the seal's first point. Painted with `--lux-primary`. */
  verified: Object.freeze({
    label: "Verified by Luxoticars",
    paths: freeze([{ d: "M22.5 12.5c0-1.58-.88-2.95-2.16-3.6.16-.45.25-.92.25-1.43 0-2.3-1.87-4.17-4.17-4.17-.51 0-1 .09-1.44.26A4.15 4.15 0 0 0 12 1.5c-1.58 0-2.95.88-3.6 2.17a4.1 4.1 0 0 0-1.43-.26c-2.3 0-4.17 1.87-4.17 4.17 0 .51.09.98.25 1.43A4.07 4.07 0 0 0 1 12.5c0 1.55.85 2.9 2.1 3.56-.06.32-.1.66-.1 1 0 2.3 1.87 4.17 4.17 4.17.5 0 .98-.09 1.43-.25a4.07 4.07 0 0 0 3.6 2.17c1.58 0 2.95-.88 3.6-2.17.45.16.92.25 1.43.25 2.3 0 4.17-1.87 4.17-4.17 0-.34-.04-.68-.1-1A4.08 4.08 0 0 0 22.5 12.5ZM10.1 16.6L6.4 12.9L7.8 11.5L10.1 13.8L15.7 8.2L17.1 9.6Z", fillRule: "evenodd" }]),
  }),
  /* A location pin with a round hole, from the profile page's shop address. */
  pin: Object.freeze({
    label: "Location",
    paths: freeze([{ d: "M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z", fillRule: "evenodd" }]),
  }),
});
