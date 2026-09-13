/**
 * Default footer content, lifted verbatim from the live luxoticars-homepage and
 * luxoticars-vi footers. Every array is overridable via the matching Footer prop;
 * these exist so `<Footer />` renders the real thing with no configuration.
 */

export const brandLinks = [
  { label: "Ferrari",      href: "/search?q=Ferrari" },
  { label: "Lamborghini",  href: "/search?q=Lamborghini" },
  { label: "Rolls-Royce",  href: "/search?q=Rolls-Royce" },
  { label: "Maserati",     href: "/search?q=Maserati" },
  { label: "McLaren",      href: "/search?q=McLaren" },
  { label: "Porsche",      href: "/search?q=Porsche" },
  { label: "Bentley",      href: "/search?q=Bentley" },
  { label: "Aston Martin", href: "/search?q=Aston+Martin" },
  { label: "Bugatti",      href: "/search?q=Bugatti" },
  { label: "Pagani",       href: "/search?q=Pagani" },
];

export const companyLinks = [
  { label: "About Us", href: "/a/" },
  { label: "Clients", href: "/a/clients/" },
  { label: "Car Reviews", href: "/a/car-reviews/" },
];

export const legalLinks = [
  { label: "Privacy Policy", href: "/a/privacy-policy/" },
  { label: "Terms of Service", href: "/a/terms-of-service/" },
];

export const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/luxoticars",
    path: "M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/luxoticars",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@luxoticars",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@luxoticars",
    path: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z",
  },
  {
    label: "Shopee",
    href: "https://shopee.com.my/luxoticars",
    path: "M7.004 7.083V6.52a4.995 4.995 0 0 1 9.99 0v.562c.87.183 1.628.67 2.14 1.369l.085.13 1.78 10.688c.23.899-.064 1.851-.763 2.463A2.517 2.517 0 0 1 18.57 22.5H5.43a2.518 2.518 0 0 1-1.667-.768 2.506 2.506 0 0 1-.636-1.925l1.64-9.827a2.52 2.52 0 0 1 2.237-2.897zM12 3.02a3.5 3.5 0 0 0-3.497 3.5v.47a24.66 24.66 0 0 1 6.993 0v-.47A3.5 3.5 0 0 0 12 3.02zm0 7.48a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm0 1.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z",
  },
];

export const contacts = [
  {
    label: "chai@luxoticars.cc",
    href: "mailto:chai@luxoticars.cc?subject=Enquiry",
    icon: "email",
  },
  {
    label: "Message on WhatsApp",
    href: "https://wa.me/60378873839?text=Hi%2C+I%27d+like+to+enquire+about+a+vehicle.",
    icon: "whatsapp",
    external: true,
  },
];

export const tagline =
  "Dealer-direct luxury and exotic cars \u2014 curated listings with a direct line to the dealer behind every vehicle.";

export const enquiriesText =
  "Speak directly with a specialist about acquisitions or consignment.";
