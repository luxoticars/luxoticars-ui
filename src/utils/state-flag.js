/*
  Which flag goes beside a listing's state. Keys are the spellings the dash
  writes to `location_state`; values name the SVGs in `src/flags/states/`,
  exported as `@luxoticars/ui/flags/states/<slug>.svg`. Pahang has no flag
  yet, so it shows none. Kuala Lumpur uses the Federal Territory flag.
*/
const STATE_FLAG_SLUGS = {
  "Johor": "johor",
  "Kedah": "kedah",
  "Kelantan": "kelantan",
  "Melaka": "melaka",
  "Negeri Sembilan": "negeri_sembilan",
  "Perak": "perak",
  "Perlis": "perlis",
  "Pulau Pinang": "pulau_pinang",
  "Sabah": "sabah",
  "Sarawak": "sarawak",
  "Selangor": "selangor",
  "Terengganu": "terengganu",
  "W.P. Kuala Lumpur": "wilayah_persekutuan",
  "W.P. Labuan": "labuan",
  "W.P. Putrajaya": "putrajaya",
};

/** The flag file's name without `.svg`, or `undefined` when the state has none. */
export function stateFlagSlug(state) {
  return state ? STATE_FLAG_SLUGS[state] : undefined;
}
