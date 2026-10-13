/*
  Copy shared by the HTML and Astro dialog stories, so the two render the
  same dialog and can be compared side by side.
*/

/** An inline placeholder, so the stories need no network. */
export const IMAGE_SRC =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#0b1220"/><stop offset="1" stop-color="#2a6f97"/></linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/><text x="800" y="470" font-family="sans-serif" font-size="64" fill="#fff" text-anchor="middle">Photo placeholder</text></svg>',
  );

export const copy = {
  lightbox: {
    trigger: "Save this search",
    title: "Save this search?",
    body: "We will email you when a car matching these filters is listed.",
  },
  confirm: {
    trigger: "Delete listing",
    title: "Delete this listing?",
    description: "The car and its photos are removed for good.",
  },
  panel: {
    trigger: "Filters",
    title: "Filters",
    items: ["Make: Porsche", "Year: 2018 – 2024", "Mileage: under 30,000 km"],
  },
  form: {
    trigger: "Enquire",
    title: "Enquire about this car",
    description: "We reply within one working day.",
  },
  image: {
    trigger: "View photo",
    title: "Porsche 911 GT3",
    alt: "Placeholder for a photo of the car",
  },
  long: {
    trigger: "Read the terms",
    title: "Terms of sale",
    paragraphs: Array.from(
      { length: 12 },
      (_, i) =>
        `Clause ${i + 1}. The buyer inspects the car before paying the deposit, and the deposit is refundable until the inspection report is signed by both parties.`,
    ),
  },
} as const;
