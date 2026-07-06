let styleEl: HTMLStyleElement | null = null;

export function setPrintPageSize(w: number, h: number) {
  if (styleEl) styleEl.remove();
  styleEl = document.createElement('style');
  styleEl.textContent = `@page { size: ${w}px ${h}px; margin: 0; }`;
  document.head.appendChild(styleEl);
}

export function clearPrintPageSize() {
  if (styleEl) {
    styleEl.remove();
    styleEl = null;
  }
}
