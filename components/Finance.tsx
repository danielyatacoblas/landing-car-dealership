'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CARS } from '@/lib/cars';
import { installment } from '@/lib/finance';
import { gsap, reduced } from '@/lib/motion';

const TERMS = [24, 36, 48, 60];
const usd = (n: number) => `US$ ${n.toLocaleString('en-US')}`;

export default function Finance({ carId, onCar }: { carId: string; onCar: (id: string) => void }) {
  const car = CARS.find((c) => c.id === carId)!;
  const [down, setDown] = useState(20);
  const [months, setMonths] = useState(48);
  const [tea, setTea] = useState(11.5);
  const r = installment(car.price, down, months, tea);
  const num = useRef<HTMLSpanElement>(null);
  const shown = useRef(r.cuota);

  // La cuota cuenta hacia su nuevo valor en vez de saltar: se lee el cambio.
  useEffect(() => {
    const el = num.current;
    if (!el) return;
    if (reduced()) { el.textContent = r.cuota.toLocaleString('en-US'); shown.current = r.cuota; return; }
    const o = { v: shown.current };
    const t = gsap.to(o, {
      v: r.cuota, duration: 0.5, ease: 'expo.out',
      onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('en-US'); },
      onComplete: () => { shown.current = r.cuota; },
    });
    return () => { t.kill(); shown.current = Math.round(o.v); };
  }, [r.cuota]);

  return (
    <section className="fin" id="cuota" aria-labelledby="fin-title">
      <div className="fin__media">
        <Image src={car.img} alt={car.alt} fill sizes="(max-width: 900px) 100vw, 45vw" quality={75} key={car.id} className="fin__img" />
      </div>
      <div className="fin__body">
        <h2 id="fin-title">Tu cuota, sin llamar a nadie</h2>
        <form className="fin__form" onSubmit={(e) => e.preventDefault()}>
          <label className="field field--light">
            <span>Auto</span>
            <select value={carId} onChange={(e) => onCar(e.target.value)}>
              {CARS.map((c) => <option key={c.id} value={c.id}>{c.make} {c.model} · {usd(c.price)}</option>)}
            </select>
          </label>
          <label className="field field--light">
            <span>Cuota inicial: <b className="tnum">{down} % · {usd(r.down)}</b></span>
            <input type="range" min={10} max={60} step={5} value={down} onChange={(e) => setDown(Number(e.target.value))} />
          </label>
          <fieldset className="field field--light">
            <legend>Plazo</legend>
            <div className="seg seg--light" role="radiogroup" aria-label="Plazo en meses">
              {TERMS.map((m) => (
                <button key={m} type="button" role="radio" aria-checked={months === m} onClick={() => setMonths(m)} className="tnum">{m} meses</button>
              ))}
            </div>
          </fieldset>
          <label className="field field--light">
            <span>Tasa efectiva anual: <b className="tnum">{tea.toFixed(1)} %</b></span>
            <input type="range" min={7} max={18} step={0.5} value={tea} onChange={(e) => setTea(Number(e.target.value))} />
          </label>
        </form>

        <div className="fin__result" aria-live="polite">
          <p className="fin__cuota">
            <span className="fin__cur">US$</span>
            <span ref={num} className="tnum">{r.cuota.toLocaleString('en-US')}</span>
            <span className="fin__per">al mes</span>
          </p>
          <dl className="fin__rows">
            <div><dt>Monto financiado</dt><dd className="tnum">{usd(r.principal)}</dd></div>
            <div><dt>Intereses totales</dt><dd className="tnum">{usd(r.interest)}</dd></div>
            <div><dt>Pagas en total</dt><dd className="tnum">{usd(r.principal + r.interest + r.down)}</dd></div>
          </dl>
          <a href="#test-drive" className="btn btn--sign">Quiero manejarlo primero</a>
          <p className="note">Simulación con sistema francés, sin seguros ni comisiones. Una entidad financiera confirma la tasa final.</p>
        </div>
      </div>
    </section>
  );
}
