/*
  The site header's phone menu, shared by `astro/SiteHeader.astro` and the
  Marko headers. <details> opens and closes itself; `wireSiteMenu` adds
  tap-outside, Escape, tabbing out and closing once a link in the panel is
  chosen. `closeMenuWhenLinksShow` closes it when the links come back into
  the bar on a wider screen; the phone header has no links in its bar, so it
  leaves that one out and ships less. Every listener is removed when `signal`
  aborts.
*/

/** Returns a function that closes the menu if the bar's links are showing. */
export function closeMenuWhenLinksShow(menu, nav, signal) {
  // On tablets the links come back into the bar as the search hides, or as a
  // window widens; an open menu would list them twice.
  const closeIfLinksShown = () => {
    if (menu.open && nav && getComputedStyle(nav).display !== "none") menu.open = false;
  };
  window.addEventListener("resize", closeIfLinksShown, { signal });
  return closeIfLinksShown;
}

export function wireSiteMenu(menu, signal) {
  // Outside on pointerdown: iOS Safari sends no click to the document for a
  // tap on plain content. Choosing a link still closes on click.
  document.addEventListener(
    "pointerdown",
    (event) => {
      if (menu.open && !menu.contains(event.target)) menu.open = false;
    },
    { signal },
  );
  menu.addEventListener(
    "click",
    (event) => {
      if (event.target.closest("a")) menu.open = false;
    },
    { signal },
  );
  // Escape while focus is in the menu, or nowhere in particular (Safari
  // leaves focus on the page when the button is clicked or tapped), so it
  // never steals an Escape meant for another control on the page.
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Escape" || !menu.open) return;
      const active = document.activeElement;
      if (active && active !== document.body && !menu.contains(active)) return;
      menu.open = false;
      menu.querySelector("summary")?.focus();
    },
    { signal },
  );
  // Tabbing out of the menu closes it, so it never sits open over the page.
  // Only when focus lands somewhere else: Safari drops focus on a plain click
  // (no relatedTarget), and closing then would swallow a link tap.
  menu.addEventListener(
    "focusout",
    (event) => {
      const next = event.relatedTarget;
      if (next && !menu.contains(next)) menu.open = false;
    },
    { signal },
  );
}
