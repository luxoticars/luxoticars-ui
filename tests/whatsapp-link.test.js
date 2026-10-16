import { test } from "node:test";
import assert from "node:assert/strict";
import { contacts, whatsappLink } from "../src/data/footer.js";

test("whatsappLink types the message into a wa.me link", () => {
  assert.equal(
    whatsappLink("Hi, I'd like to enquire about a vehicle."),
    "https://wa.me/60378873839?text=Hi%2C+I%27d+like+to+enquire+about+a+vehicle.",
  );
});

test("the footer's WhatsApp contact is unchanged", () => {
  assert.equal(
    contacts.find((c) => c.icon === "whatsapp").href,
    "https://wa.me/60378873839?text=Hi%2C+I%27d+like+to+enquire+about+a+vehicle.",
  );
});
