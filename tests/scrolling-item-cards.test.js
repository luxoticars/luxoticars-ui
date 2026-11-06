import { test } from "node:test";
import assert from "node:assert/strict";
import { initScrollingItemCards } from "../src/scripts/scrolling-item-cards.js";

function createFixture({
  overflow = true,
  scrollLeft = 0,
  maxScroll = 400,
  clientWidth = 200,
  itemWidth = 100,
  gap = 16,
  hasTitleCard = false,
  mqMatches = false,
} = {}) {
  const listeners = { scroll: [], resize: [], button: [] };
  const state = { scrollLeft, maxScroll: overflow ? maxScroll : 0, clientWidth };
  let active = null;

  function makeButton(label, kind) {
    return {
      kind,
      hidden: true,
      disabled: false,
      getAttribute: (n) => (n === "aria-label" ? label : null),
      focus() {
        active = this;
      },
      addEventListener(type, fn) {
        if (type === "click") listeners.button.push({ kind, fn });
      },
    };
  }

  const prev = makeButton("Previous", "prev");
  const next = makeButton("Next", "next");
  const item = { offsetWidth: itemWidth };
  const titleCard = hasTitleCard ? { offsetWidth: itemWidth } : null;

  const scrolled = [];

  function makeScrollport(name) {
    return {
      name,
      style: { columnGap: `${gap}px`, gap: `${gap}px` },
      get clientWidth() {
        return state.clientWidth;
      },
      get scrollWidth() {
        return state.clientWidth + state.maxScroll;
      },
      get scrollLeft() {
        return state.scrollLeft;
      },
      set scrollLeft(v) {
        state.scrollLeft = v;
      },
      scrollBy({ left, behavior }) {
        scrolled.push({ name, left, behavior });
        state.scrollLeft = Math.min(state.maxScroll, Math.max(0, state.scrollLeft + left));
        for (const fn of listeners.scroll) fn();
      },
      addEventListener(type, fn) {
        if (type === "scroll") listeners.scroll.push(fn);
      },
      querySelectorAll(sel) {
        if (sel === ".scrolling-item-cards__item") return [item, item, item, item];
        return [];
      },
    };
  }

  const track = makeScrollport("track");
  const flow = makeScrollport("flow");

  const win = {
    matchMedia: (q) => ({
      matches: String(q).includes("768") ? mqMatches : false,
      addEventListener() {},
      removeEventListener() {},
    }),
    getComputedStyle: (el) => ({
      columnGap: el.style.columnGap || "0px",
      gap: el.style.gap || "0px",
    }),
    addEventListener(type, fn) {
      if (type === "resize") listeners.resize.push(fn);
    },
    ResizeObserver: class {
      observe() {}
      disconnect() {}
    },
  };

  const root = {
    ownerDocument: {
      defaultView: win,
      get activeElement() {
        return active;
      },
    },
    hasAttribute: () => false,
    setAttribute() {},
    querySelector(sel) {
      if (sel === ".scrolling-item-cards__control--prev") return prev;
      if (sel === ".scrolling-item-cards__control--next") return next;
      if (sel === ".scrolling-item-cards__flow") return flow;
      if (sel === ".scrolling-item-cards__track") return track;
      if (sel === ".scrolling-item-cards__title-card") return titleCard;
      if (sel === ".scrolling-item-cards__item") return item;
      return null;
    },
    focus() {
      active = root;
    },
  };

  return {
    root,
    prev,
    next,
    state,
    listeners,
    scrolled,
    setActive(btn) {
      active = btn;
    },
    get active() {
      return active;
    },
  };
}

test("no overflow: both buttons stay hidden after init", () => {
  const f = createFixture({ overflow: false });
  initScrollingItemCards(f.root);
  assert.equal(f.prev.hidden, true);
  assert.equal(f.next.hidden, true);
});

test("start: prev disabled, next shown and enabled", () => {
  const f = createFixture({ overflow: true, scrollLeft: 0 });
  initScrollingItemCards(f.root);
  assert.equal(f.prev.hidden, false);
  assert.equal(f.next.hidden, false);
  assert.equal(f.prev.disabled, true);
  assert.equal(f.next.disabled, false);
});

test("middle: both enabled", () => {
  const f = createFixture({ overflow: true, scrollLeft: 100, maxScroll: 400 });
  initScrollingItemCards(f.root);
  assert.equal(f.prev.disabled, false);
  assert.equal(f.next.disabled, false);
});

test("end: next disabled, prev shown and enabled", () => {
  const f = createFixture({ overflow: true, scrollLeft: 400, maxScroll: 400 });
  initScrollingItemCards(f.root);
  assert.equal(f.next.disabled, true);
  assert.equal(f.prev.disabled, false);
});

test("double-init on the same root is a no-op", () => {
  const f = createFixture({ overflow: true });
  initScrollingItemCards(f.root);
  const buttonListeners = f.listeners.button.length;
  initScrollingItemCards(f.root);
  assert.equal(f.listeners.button.length, buttonListeners);
});

test("focus moves to the other button when the focused one disables", () => {
  const f = createFixture({ overflow: true, scrollLeft: 0, maxScroll: 400 });
  initScrollingItemCards(f.root);
  f.setActive(f.next);
  f.state.scrollLeft = 400;
  for (const fn of f.listeners.scroll) fn();
  assert.equal(f.next.disabled, true);
  assert.equal(f.active, f.prev);
});

test("focus moves to the section when controls hide", () => {
  const f = createFixture({ overflow: true, scrollLeft: 0, maxScroll: 400 });
  initScrollingItemCards(f.root);
  f.setActive(f.next);
  f.state.maxScroll = 0;
  f.state.scrollLeft = 0;
  for (const fn of f.listeners.scroll) fn();
  assert.equal(f.prev.hidden, true);
  assert.equal(f.next.hidden, true);
  assert.equal(f.active, f.root);
});

test("next click scrollBys by the first item width plus gap", () => {
  const f = createFixture({ overflow: true, itemWidth: 100, gap: 16, scrollLeft: 0 });
  initScrollingItemCards(f.root);
  const nextClick = f.listeners.button.find((b) => b.kind === "next");
  nextClick.fn();
  assert.equal(f.scrolled.at(-1).left, 116);
});

test("wide viewport with a title-card scrollBys on flow, not track", () => {
  const f = createFixture({ overflow: true, hasTitleCard: true, mqMatches: true });
  initScrollingItemCards(f.root);
  const nextClick = f.listeners.button.find((b) => b.kind === "next");
  nextClick.fn();
  assert.equal(f.scrolled.at(-1).name, "flow");
});

test("narrow viewport with a title-card scrollBys on track, not flow", () => {
  const f = createFixture({ overflow: true, hasTitleCard: true, mqMatches: false });
  initScrollingItemCards(f.root);
  const nextClick = f.listeners.button.find((b) => b.kind === "next");
  nextClick.fn();
  assert.equal(f.scrolled.at(-1).name, "track");
});

test("initScrollingItemCards(null) does nothing", () => {
  assert.doesNotThrow(() => initScrollingItemCards(null));
  assert.doesNotThrow(() => initScrollingItemCards(undefined));
});
