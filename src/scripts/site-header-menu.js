/*
  The site header's phone menu, shared by `astro/SiteHeader.astro` and
  `marko/site-header.marko`. <details> opens and closes itself; this adds
  tap-outside, Escape, tabbing out, closing once a link in the panel is
  chosen, and closing when the links come back into the bar on a wider
  screen. Every listener is removed when `signal` aborts.
*/

export function wireSiteMenu(menu, nav, signal) {
  // On tablets the links come back into the bar as the search hides, or as a
  // phone rotates to landscape; an open menu would list them twice.
  const closeIfLinksShown = () => {
    if (menu.open && nav && getComputedStyle(nav).display !== "none") menu.open = false;
  };
  window.addEventListener("resize", closeIfLinksShown, { signal });

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
  return closeIfLinksShown;
}
