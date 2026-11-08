// Schlanke Inline-SVG-Icons (angelehnt an Lucide, MIT-Lizenz) für die
// statischen Seiten. Werden direkt als Markup in die generierten HTML-Seiten
// eingebettet – kein externes CDN, volle Kontrolle über Farbe/Grösse via CSS
// (Icons erben currentColor).
function svg(paths, viewBox = "0 0 24 24") {
  return `<svg viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

function svgFilled(paths, viewBox = "0 0 24 24") {
  return `<svg viewBox="${viewBox}" fill="currentColor" aria-hidden="true">${paths}</svg>`;
}

export const icons = {
  mountain: svg(
    '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>'
  ),
  calendar: svg(
    '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'
  ),
  cheese: svg(
    '<path d="M3 17V9l18-5v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><circle cx="8" cy="14" r="1"/><circle cx="13" cy="12" r="1"/>'
  ),
  coins: svg(
    '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/>'
  ),
  users: svg(
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'
  ),
  video: svg(
    '<path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/>'
  ),
  warning: svg(
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>'
  ),
  mapPin: svg(
    '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'
  ),
  phone: svg(
    '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/>'
  ),
  mail: svg(
    '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>'
  ),
  home: svg(
    '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/>'
  ),
  link: svg(
    '<path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.5"/><path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07L12.5 19.5"/>'
  ),
  instagram: svg(
    '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>'
  ),
  facebook: svg(
    '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z"/>'
  ),
  chevronLeft: svg('<path d="m15 18-6-6 6-6"/>'),
  chevronRight: svg('<path d="m9 18 6-6-6-6"/>'),
  chevronDown: svg('<path d="m6 9 6 6 6-6"/>'),
  arrowUp: svg('<path d="M12 19V5M5 12l7-7 7 7"/>'),
  play: svgFilled('<path d="M6 4v16l14-8Z"/>'),
};

export function icon(name, extraClass = "") {
  const markup = icons[name];
  if (!markup) throw new Error(`Unbekanntes Icon: ${name}`);
  return extraClass
    ? markup.replace("<svg ", `<svg class="${extraClass}" `)
    : markup;
}
