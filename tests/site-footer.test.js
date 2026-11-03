import assert from "node:assert/strict";
import { test } from "node:test";
import { buildModel, safeHref } from "../src/marko/lx-site-footer/helper.ts";

test("safeHref: paths, anchors and http(s), mailto and tel pass through unchanged", () => {
  for (const href of ["/search?q=Ferrari", "#top", "?page=2", "//cdn.example.com/a", "https://example.com/a", "HTTP://EXAMPLE.COM", "mailto:a@b.cc?subject=Hi", "tel:+60123456789", "a/b"]) {
    assert.equal(safeHref(href), href);
  }
});

test("safeHref: any other scheme becomes #, including ones hidden by whitespace or control characters", () => {
  for (const href of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", " javascript:alert(1)", "java\tscript:alert(1)", "java\nscript:alert(1)", "\u0001javascript:alert(1)", "data:text/html,<b>x</b>", "vbscript:x"]) {
    assert.equal(safeHref(href), "#");
  }
});

test("buildModel: links, socials, contacts and the home link all go through safeHref", () => {
  const evil = "javascript:alert(1)";
  const model = buildModel({
    homeHref: evil,
    brandLinks: [{ label: "x", href: evil }],
    companyLinks: [{ label: "y", href: "/ok" }],
    legalLinks: [{ label: "z", href: evil, external: true }],
    socials: [{ label: "s", href: evil, path: "M0 0" }],
    contacts: [{ label: "c", href: evil, icon: "email" }],
  });
  assert.equal(model.homeHref, "#");
  assert.equal(model.brandLinks[0].href, "#");
  assert.equal(model.companyLinks[0].href, "/ok");
  assert.equal(model.legalLinks[0].href, "#");
  assert.equal(model.legalLinks[0].target, "_blank");
  assert.equal(model.socials[0].href, "#");
  assert.equal(model.contacts[0].href, "#");
});

test("buildModel: the defaults pass through unchanged", () => {
  const model = buildModel({ year: 2026 });
  assert.equal(model.brandLinks[0].href, "/search?q=Ferrari");
  assert.ok(model.contacts.every((contact) => /^(mailto:|https:)/.test(contact.href)));
  assert.ok(model.socials.every((social) => social.href.startsWith("https://")));
  assert.equal(model.copyright, "© 2026 Luxoticars. All rights reserved.");
});
