import { initAudio } from './audio';

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

function initTheme() {
  document.querySelectorAll('[data-theme-toggle]').forEach((b) => b.addEventListener('click', toggleTheme));
}

function initMenu() {
  const btn = document.querySelector<HTMLButtonElement>('.hdr__menu');
  const panel = document.getElementById('hdr-panel');
  if (!btn || !panel) return;
  const set = (open: boolean) => {
    btn.setAttribute('aria-expanded', String(open));
    panel.toggleAttribute('data-open', open);
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
      set(false);
      btn.focus();
    }
  });
}

function initCopy() {
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    const label = btn.querySelector<HTMLElement>('[data-copy-label]');
    const original = label?.textContent ?? '';
    btn.addEventListener('click', async () => {
      const ok = await copyText(btn.dataset.copy!);
      if (!label) return;
      label.textContent = ok ? 'Copied' : 'Copy failed';
      btn.toggleAttribute('data-copied', ok);
      announce(ok ? 'Email copied to clipboard' : 'Could not copy');
      setTimeout(() => {
        label.textContent = original;
        btn.removeAttribute('data-copied');
      }, 1800);
    });
  });
}

function initClock() {
  const clocks = document.querySelectorAll<HTMLElement>('[data-clock]');
  if (!clocks.length) return;
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  const render = () => {
    const now = fmt.format(new Date());
    clocks.forEach((c) => (c.textContent = now));
  };
  render();
  setInterval(render, 1000);
}

function initModKey() {
  const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  if (!mac) document.querySelectorAll('.kbd-mod').forEach((k) => (k.textContent = 'Ctrl+'));
}

initTheme();
initMenu();
initCopy();
initClock();
initModKey();
initAudio();
