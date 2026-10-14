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
});
