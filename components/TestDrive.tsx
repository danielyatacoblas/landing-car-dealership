'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { CARS } from '@/lib/cars';
import { sb } from '@/lib/supabase';

const SLOTS = ['09:00', '10:30', '12:00', '15:00', '16:30', '18:00'];
type Errors = Partial<Record<'name' | 'phone' | 'day' | 'slot', string>>;

function nextDays(n: number) {
  const out: Date[] = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  while (out.length < n) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) out.push(new Date(d)); // domingo cerrado
  }
  return out;
}

export default function TestDrive({ carId }: { carId: string }) {
  const [days, setDays] = useState<Date[]>([]);
  const [model, setModel] = useState(carId);
  const [day, setDay] = useState<number | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => setDays(nextDays(8)), []);
  useEffect(() => setModel(carId), [carId]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get('name') || '').trim();
    const phone = String(f.get('phone') || '').replace(/\s/g, '');
    const err: Errors = {};
    if (name.length < 3) err.name = 'Escribe tu nombre y apellido.';
    if (!/^9\d{8}$/.test(phone)) err.phone = 'Usa un celular peruano de 9 dígitos que empiece con 9.';
    if (day === null) err.day = 'Elige un día.';
    if (!slot) err.slot = 'Elige una hora.';
    setErrors(err);
    if (Object.keys(err).length) return;

    setSending(true);
    const car = CARS.find((c) => c.id === model)!;
    const when = days[day!].toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
    await sb.leads(`${name} · ${phone}`, `hito-test-drive · ${car.model} · ${when} ${slot}`);
    sb.events('test_drive', { model, day: days[day!].toISOString().slice(0, 10), slot });
    setSending(false);
    setDone(`Listo, ${name.split(' ')[0]}. Te esperamos el ${when} a las ${slot} con el ${car.make} ${car.model} cargado al 100 %.`);
  }

  return (
    <section className="td" id="test-drive" aria-labelledby="td-title">
      <div className="td__intro">
        <h2 id="td-title">Manéjalo 45 minutos por la Costa Verde</h2>
        <p>Salimos desde el showroom en Surquillo, sin vendedor a bordo si lo prefieres. Te confirmamos por WhatsApp.</p>
      </div>

      {done ? (
        <div className="td__done" role="status">
          <p>{done}</p>
          <button type="button" className="link" onClick={() => { setDone(null); setDay(null); setSlot(null); }}>Agendar otro</button>
        </div>
      ) : (
        <form className="td__form" onSubmit={submit} noValidate>
          <label className="field field--light">
            <span>Nombre y apellido</span>
            <input name="name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby="e-name" />
            <small id="e-name" className="err">{errors.name}</small>
          </label>
          <label className="field field--light">
            <span>Celular</span>
            <input name="phone" inputMode="numeric" autoComplete="tel-national" placeholder="9XX XXX XXX" aria-invalid={!!errors.phone} aria-describedby="e-phone" />
            <small id="e-phone" className="err">{errors.phone}</small>
          </label>
          <label className="field field--light td__wide">
            <span>Modelo</span>
            <select value={model} onChange={(e) => setModel(e.target.value)}>
              {CARS.map((c) => <option key={c.id} value={c.id}>{c.make} {c.model}</option>)}
            </select>
          </label>
          <fieldset className="field field--light td__wide" aria-describedby="e-day">
            <legend>Día</legend>
            <div className="days">
              {days.map((d, i) => (
                <button key={i} type="button" className="day" aria-pressed={day === i} onClick={() => setDay(i)}>
                  <span>{d.toLocaleDateString('es-PE', { weekday: 'short' }).replace('.', '')}</span>
                  <b className="tnum">{d.getDate()}</b>
                </button>
              ))}
            </div>
            <small id="e-day" className="err">{errors.day}</small>
          </fieldset>
          <fieldset className="field field--light td__wide" aria-describedby="e-slot">
            <legend>Hora</legend>
            <div className="slots">
              {SLOTS.map((s) => (
                <button key={s} type="button" className="chip" aria-pressed={slot === s} onClick={() => setSlot(s)}><span className="tnum">{s}</span></button>
              ))}
            </div>
            <small id="e-slot" className="err">{errors.slot}</small>
          </fieldset>
          <button type="submit" className="btn btn--sign td__wide" disabled={sending}>{sending ? 'Agendando…' : 'Agendar test drive'}</button>
        </form>
      )}
    </section>
  );
}
