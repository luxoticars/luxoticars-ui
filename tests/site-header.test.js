import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveSiteHeader, SITE_HEADER_LINKS } from "../src/utils/site-header.js";

/* The resolver decides what both site headers print (astro/SiteHeader.astro
   and the two Marko headers in marko/), so they cannot disagree. */

test("defaults: Buy, Reviews, About and the Advertise button", () => {
  const header = resolveSiteHeader();
  assert.deepEqual(header.links.map((l) => l.label), ["Buy", "Reviews", "About"]);
  assert.deepEqual(header.cta, { first: "Advertise", rest: " your car", label: "Advertise your car" });
  assert.ok(Object.isFrozen(SITE_HEADER_LINKS));
});

test("an external link opens in a new tab, an internal one does not", () => {
  const [internal, external] = resolveSiteHeader({
    links: [{ label: "Buy", href: "/search" }, { label: "Blog", href: "https://example.com", external: true }],
  }).links;
  assert.equal(internal.target, undefined);
  assert.deepEqual([external.target, external.rel], ["_blank", "noopener noreferrer"]);
});

test("call to action: one word needs no separate name, an empty label renders no button", () => {
  assert.deepEqual(resolveSiteHeader({ ctaLabel: " Sell " }).cta, { first: "Sell", rest: "", label: undefined });
  assert.equal(resolveSiteHeader({ ctaLabel: "   " }).cta, null);
});
