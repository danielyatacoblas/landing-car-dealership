'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { CARS, type Body, type Car } from '@/lib/cars';
import { installment } from '@/lib/finance';
import { gsap, reduced } from '@/lib/motion';
import Select from './Select';

const BODIES: Array<'Todos' | Body> = ['Todos', 'SUV', 'Crossover', 'Sedán'];
type Sort = 'range' | 'price-asc' | 'price-desc';
const usd = (n: number) => `US$ ${n.toLocaleString('en-US')}`;

export default function Inventory({ selected, onSimulate, onFinance }: {
  selected: string;
  onSimulate: (id: string) => void;
  onFinance: (id: string) => void;
}) {
  const [body, setBody] = useState<(typeof BODIES)[number]>('Todos');
  const [sort, setSort] = useState<Sort>('range');
  const [compare, setCompare] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const root = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const cars = useMemo(() => {
    const list = body === 'Todos' ? CARS : CARS.filter((c) => c.body === body);
    return [...list].sort((a, b) =>
      sort === 'range' ? b.range - a.range : sort === 'price-asc' ? a.price - b.price : b.price - a.price);
  }, [body, sort]);

  useEffect(() => {
    if (!root.current || reduced()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.car', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: 'expo.out', scrollTrigger: { trigger: '.cars', start: 'top 85%' } });
    }, root);
    return () => ctx.revert();
  }, [cars]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (showCompare && !d.open) d.showModal();
    if (!showCompare && d.open) d.close();
  }, [showCompare]);

  function toggle(id: string) {
    setCompare((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= 3 ? cur : [...cur, id]));
  }

  const picked = CARS.filter((c) => compare.includes(c.id));
  const best = (k: keyof Car, dir: 1 | -1) => {
    const vals = picked.map((c) => c[k] as number);
    return dir === 1 ? Math.max(...vals) : Math.min(...vals);
  };

  return (
    <section className="inv" id="inventario" ref={root} aria-labelledby="inv-title">
      <div className="inv__head">
        <h2 id="inv-title">Ocho eléctricos, listos para la Panamericana</h2>
        <div className="inv__tools">
          <div className="chips" role="group" aria-label="Tipo de carrocería">
            {BODIES.map((b) => (
              <button key={b} type="button" className="chip" aria-pressed={body === b} onClick={() => setBody(b)}>{b}</button>
            ))}
          </div>
          <Select
            className="sel--sort"
            label="Ordenar por"
            value={sort}
            onChange={(v) => setSort(v as Sort)}
            options={[{ value: 'range', label: 'Mayor autonomía' }, { value: 'price-asc', label: 'Menor precio' }, { value: 'price-desc', label: 'Mayor precio' }]}
          />
        </div>
      </div>

      <ul className="cars">
        {cars.map((c) => {
          const cuota = installment(c.price, 20, 60, 11.5).cuota;
          const on = compare.includes(c.id);
          return (
            <li key={c.id} className="car" data-selected={selected === c.id ? '' : undefined}>
              <div className="car__media">
                <Image src={c.img} alt={c.alt} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw" quality={75} />
                <span className="hito tnum" aria-label={`${c.range} kilómetros de autonomía`}>{c.range}<small>km</small></span>
              </div>
              <div className="car__body">
                <h3>{c.make} {c.model}</h3>
                <dl className="car__specs">
                  <div><dt>Batería</dt><dd className="tnum">{c.battery} kWh</dd></div>
                  <div><dt>Carga rápida</dt><dd className="tnum">{c.dcKw} kW</dd></div>
                  <div><dt>Asientos</dt><dd className="tnum">{c.seats}</dd></div>
                </dl>
                <p className="car__price"><span className="tnum">{usd(c.price)}</span> <span className="car__cuota">o <b className="tnum">{usd(cuota)}</b>/mes</span></p>
                <div className="car__actions">
                  <button type="button" className="btn btn--sign btn--sm" onClick={() => onSimulate(c.id)}>Simular ruta</button>
                  <button type="button" className="link" onClick={() => onFinance(c.id)}>Calcular cuota</button>
                  <label className="check">
                    <input type="checkbox" checked={on} disabled={!on && compare.length >= 3} onChange={() => toggle(c.id)} />
                    <span>Comparar</span>
                  </label>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="note">Autonomía WLTP aproximada. Precios y cuotas de demostración (20 % inicial, 60 meses, TEA 11,5 %).</p>

      <div className="tray" data-show={compare.length ? '' : undefined} aria-hidden={!compare.length}>
        <p><b className="tnum">{compare.length}</b> de 3 para comparar</p>
        <button type="button" className="btn btn--sign btn--sm" disabled={compare.length < 2} onClick={() => setShowCompare(true)}>
          Comparar {compare.length >= 2 ? 'ahora' : '(elige 2)'}
        </button>
        <button type="button" className="link link--light" onClick={() => setCompare([])}>Limpiar</button>
      </div>

      <dialog ref={dialog} className="cmp" aria-labelledby="cmp-title" onClose={() => setShowCompare(false)}>
        <div className="cmp__top">
          <h2 id="cmp-title">Comparación</h2>
          <button type="button" className="link" onClick={() => setShowCompare(false)}>Cerrar</button>
        </div>
        {picked.length >= 2 && (
          <div className="cmp__scroll">
            <table>
              <thead>
                <tr><th scope="col"><span className="sr">Dato</span></th>{picked.map((c) => <th scope="col" key={c.id}>{c.make} {c.model}</th>)}</tr>
              </thead>
              <tbody>
                {([
                  ['Autonomía', 'range', 1, (v: number) => `${v} km`],
                  ['Batería', 'battery', 1, (v: number) => `${v} kWh`],
                  ['Carga rápida', 'dcKw', 1, (v: number) => `${v} kW`],
                  ['Asientos', 'seats', 1, (v: number) => `${v}`],
                  ['Precio', 'price', -1, (v: number) => usd(v)],
                ] as const).map(([label, k, dir, fmt]) => (
                  <tr key={k}>
                    <th scope="row">{label}</th>
                    {picked.map((c) => {
                      const v = c[k] as number;
                      const win = v === best(k, dir);
                      return <td key={c.id} className="tnum" data-best={win ? '' : undefined}>{fmt(v)}{win && <span className="sr"> (mejor)</span>}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </dialog>
    </section>
  );
}
