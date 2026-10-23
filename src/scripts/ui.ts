import { initAudio } from './audio';

// Runs once per visit. The site navigates client-side (Astro's ClientRouter),
// so listeners use event delegation on `document` and survive page swaps;
// anything tied to a specific page's elements reruns on `astro:page-load`.

const root = document.documentElement;

export function announce(msg: string) {
  const el = document.getElementById('announcer');
  if (!el) return;
  el.textContent = '';
  requestAnimationFrame(() => (el.textContent = msg));
}

export function toggleTheme() {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  root.dataset.theme = next;
  try {
    localStorage.setItem('theme', next);
  } catch {}
  announce(`Theme: ${next}`);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

function setMenu(open: boolean) {
  const btn = document.querySelector<HTMLButtonElement>('.hdr__menu');
  const panel = document.getElementById('hdr-panel');
  if (!btn || !panel) return;
  btn.setAttribute('aria-expanded', String(open));
  panel.toggleAttribute('data-open', open);
}

async function copyFrom(btn: HTMLElement) {
  const label = btn.querySelector<HTMLElement>('[data-copy-label]');
  const original = label?.dataset.original ?? label?.textContent ?? '';
  if (label) label.dataset.original = original;
  const ok = await copyText(btn.dataset.copy!);
  announce(ok ? 'Email copied to clipboard' : 'Could not copy');
  if (!label) return;
  label.textContent = ok ? 'Copied' : 'Copy failed';
  btn.toggleAttribute('data-copied', ok);
  setTimeout(() => {
    label.textContent = original;
    btn.removeAttribute('data-copied');
  }, 1800);
}

document.addEventListener('click', (e) => {
  const t = e.target as Element;
  if (t.closest('[data-theme-toggle]')) toggleTheme();
  const menu = t.closest('.hdr__menu');
  if (menu) setMenu(menu.getAttribute('aria-expanded') !== 'true');
  const copy = t.closest<HTMLElement>('[data-copy]');
  if (copy) copyFrom(copy);
});

document.addEventListener('keydown', (e) => {
  const btn = document.querySelector<HTMLButtonElement>('.hdr__menu[aria-expanded="true"]');
  if (e.key === 'Escape' && btn) {
    setMenu(false);
    btn.focus();
  }
});

// Client-side navigation replaces <html>'s attributes with the new page's,
// which would drop the theme and audio state set at runtime. Carry them over.
document.addEventListener('astro:before-swap', (e: any) => {
  for (const name of ['data-theme', 'data-audio']) {
    const v = root.getAttribute(name);
    if (v) e.newDocument.documentElement.setAttribute(name, v);
  }
});

// NYC clock: one timer for the whole visit, filling whichever clocks are on the page.
const fmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});
function renderClocks() {
  const now = fmt.format(new Date());
  document.querySelectorAll<HTMLElement>('[data-clock]').forEach((c) => (c.textContent = now));
}
setInterval(renderClocks, 1000);

const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

// Per page (first load and every client-side navigation)
document.addEventListener('astro:page-load', () => {
  renderClocks();
  if (!mac) document.querySelectorAll('.kbd-mod').forEach((k) => (k.textContent = 'Ctrl+'));
});

initAudio();
