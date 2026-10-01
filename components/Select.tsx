'use client';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

export type Option = { value: string; label: string; hint?: string };

/** Lista desplegable propia: mismo comportamiento de teclado que un select nativo, con el diseño de la marca. */
export default function Select({ label, value, options, onChange, name, className = '' }: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  name?: string;
  className?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const current = Math.max(0, options.findIndex((o) => o.value === value));
  const [hi, setHi] = useState(current);
  const root = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: '', at: 0 });

  useEffect(() => {
    if (!open) return;
    const r = btn.current!.getBoundingClientRect();
    const below = window.innerHeight - r.bottom;
    setUp(below < 300 && r.top > below);
    list.current?.focus({ preventScroll: true });
    const out = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', out);
    return () => document.removeEventListener('pointerdown', out);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    list.current?.querySelector<HTMLElement>(`[data-i="${hi}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [hi, open]);

  function show() { setHi(current); setOpen(true); }
  function close(focus = true) { setOpen(false); if (focus) btn.current?.focus({ preventScroll: true }); }
  function choose(i: number) { onChange(options[i].value); close(); }

  function onButtonKey(e: KeyboardEvent) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); show(); }
  }

  function onListKey(e: KeyboardEvent) {
    const last = options.length - 1;
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); setHi((h) => Math.min(last, h + 1)); break;
      case 'ArrowUp': e.preventDefault(); setHi((h) => Math.max(0, h - 1)); break;
      case 'Home': e.preventDefault(); setHi(0); break;
      case 'End': e.preventDefault(); setHi(last); break;
      case 'Enter': case ' ': e.preventDefault(); choose(hi); break;
      case 'Escape': e.preventDefault(); close(); break;
      case 'Tab': close(false); break;
      default:
        // Escribir salta a la primera opción que empieza con esas letras, como en un select nativo.
        if (e.key.length === 1) {
          const now = Date.now();
          typed.current = { text: (now - typed.current.at < 700 ? typed.current.text : '') + e.key.toLowerCase(), at: now };
          const i = options.findIndex((o) => o.label.toLowerCase().startsWith(typed.current.text));
          if (i >= 0) setHi(i);
        }
    }
  }

  return (
    <div className={`sel ${className}`} ref={root} data-open={open ? '' : undefined}>
      <span className="sel__label" id={`${id}l`}>{label}</span>
      <button
        type="button"
        ref={btn}
        className="sel__btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}l ${id}v`}
        onClick={() => (open ? close() : show())}
        onKeyDown={onButtonKey}
      >
        <span className="sel__value" id={`${id}v`}>{options[current]?.label}</span>
        <svg className="sel__chev" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {name && <input type="hidden" name={name} value={value} />}
      <ul
        ref={list}
        role="listbox"
        tabIndex={-1}
        className="sel__list"
        data-up={up ? '' : undefined}
        aria-labelledby={`${id}l`}
        aria-activedescendant={open ? `${id}o${hi}` : undefined}
        onKeyDown={onListKey}
        data-lenis-prevent
      >
        {options.map((o, i) => (
          <li
            key={o.value}
            id={`${id}o${i}`}
            data-i={i}
            role="option"
            aria-selected={i === current}
            data-hi={i === hi ? '' : undefined}
            className="sel__opt"
            onPointerMove={() => setHi(i)}
            onClick={() => choose(i)}
          >
            <span className="sel__text">{o.label}{o.hint && <small>{o.hint}</small>}</span>
            {i === current && <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </li>
        ))}
      </ul>
    </div>
  );
}
