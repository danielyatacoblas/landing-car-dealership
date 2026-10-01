'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CARS } from '@/lib/cars';
import { ROUTES, RESERVE, simulate, formatDuration, type Options } from '@/lib/range';
import { gsap, reduced } from '@/lib/motion';

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(800);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(300, Math.round(e.contentRect.width))));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

export default function Simulator({ carId, routeId, onCar, onRoute }: {
  carId: string; routeId: string; onCar: (id: string) => void; onRoute: (id: string) => void;
}) {
  const [startSoc, setStartSoc] = useState(100);
  const [speed, setSpeed] = useState<Options['speed']>(100);
  const [ac, setAc] = useState(true);
  const [hover, setHover] = useState<number | null>(null);
  const [box, W] = useWidth<HTMLDivElement>();
  const lineRef = useRef<SVGPathElement>(null);
  const carRef = useRef<SVGGElement>(null);

  const car = CARS.find((c) => c.id === carId)!;
  const route = ROUTES.find((r) => r.id === routeId)!;
  const res = useMemo(() => simulate(car, route, { startSoc, speed, ac }), [car, route, startSoc, speed, ac]);

  // Geometría del gráfico (px reales para que el texto no se deforme).
  const H = W < 560 ? 220 : 260;
  const pad = { l: 40, r: 16, t: 28, b: 18 };
  const roadH = 46;
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const x = (km: number) => pad.l + (km / route.km) * iw;
  const y = (soc: number) => pad.t + (1 - soc / 100) * ih;
  const d = res.points.map((p, i) => `${i ? 'L' : 'M'}${x(p.km).toFixed(1)},${y(p.soc).toFixed(1)}`).join(' ');
  const endKm = res.strandedKm ?? route.km;
  const step = route.km > 700 ? 200 : 100;
  const posts = Array.from({ length: Math.floor(route.km / step) + 1 }, (_, i) => i * step);

  // Batería en un km dado, interpolando entre puntos (para el tooltip).
  function socAt(km: number) {
    const pts = res.points;
    for (let i = pts.length - 1; i > 0; i--) {
      const a = pts[i - 1], b = pts[i];
      if (km >= a.km && km <= b.km && b.km !== a.km) return a.soc + ((km - a.km) / (b.km - a.km)) * (b.soc - a.soc);
    }
    return null;
  }

  useEffect(() => {
    const path = lineRef.current;
    const carEl = carRef.current;
    if (!path || !carEl) return;
    const len = path.getTotalLength();
    const toX = x(endKm) - pad.l;
    if (reduced()) {
      gsap.set(path, { strokeDasharray: 'none', strokeDashoffset: 0 });
      gsap.set(carEl, { x: toX });
      return;
    }
    const tl = gsap.timeline();
    tl.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' })
      .fromTo(carEl, { x: 0 }, { x: toX, duration: 1.4, ease: 'power2.inOut' }, 0);
    return () => { tl.kill(); };
  }, [d, endKm, W]); // eslint-disable-line react-hooks/exhaustive-deps

  const headline = !res.ok
    ? `No llegas a ${route.name}: te quedas sin margen en el km ${Math.round(res.strandedKm!)}.`
    : res.stops.length === 0
      ? `Llegas a ${route.name} con ${Math.round(res.arrival)} % de batería, sin cargar.`
      : `Llegas a ${route.name} con ${Math.round(res.arrival)} %, cargando ${res.stops.length === 1 ? 'una vez' : `${res.stops.length} veces`}.`;

  const hoverSoc = hover === null ? null : socAt(hover);

  return (
    <section className="sim" id="ruta" aria-labelledby="sim-title">
      <div className="sim__head">
        <h2 id="sim-title">¿Llegas sin cargar?</h2>
        <p>Elige auto y destino desde Lima. Calculamos el consumo con la velocidad, el aire acondicionado y la subida a la sierra.</p>
      </div>

      <div className="sim__grid">
        <form className="sim__controls" onSubmit={(e) => e.preventDefault()} aria-label="Datos del viaje">
          <label className="field">
            <span>Auto</span>
            <select value={carId} onChange={(e) => onCar(e.target.value)}>
              {CARS.map((c) => <option key={c.id} value={c.id}>{c.make} {c.model} · {c.range} km</option>)}
            </select>
          </label>

          <fieldset className="field">
            <legend>Destino desde Lima</legend>
            <div className="chips chips--dark">
              {ROUTES.map((r) => (
                <button key={r.id} type="button" className="chip" aria-pressed={r.id === routeId} onClick={() => onRoute(r.id)}>
                  {r.name} <span className="tnum">{r.km}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <label className="field">
            <span>Batería al salir: <b className="tnum">{startSoc} %</b></span>
            <input type="range" min={50} max={100} step={5} value={startSoc} onChange={(e) => setStartSoc(Number(e.target.value))} />
          </label>

          <fieldset className="field">
            <legend>Velocidad crucero</legend>
            <div className="seg" role="radiogroup" aria-label="Velocidad">
              {([100, 120] as const).map((s) => (
                <button key={s} type="button" role="radio" aria-checked={speed === s} onClick={() => setSpeed(s)} className="tnum">{s} km/h</button>
              ))}
            </div>
          </fieldset>

          <label className="switch">
            <input type="checkbox" checked={ac} onChange={(e) => setAc(e.target.checked)} />
            <span className="switch__track" aria-hidden="true" />
            <span>Aire acondicionado encendido</span>
          </label>
        </form>

        <div className="sim__out">
          <p className="sim__headline" aria-live="polite" data-ok={res.ok ? '' : undefined}>{headline}</p>
          <dl className="sim__facts">
            <div><dt>Manejo</dt><dd className="tnum">{formatDuration(res.driveMinutes)}</dd></div>
            <div><dt>Carga</dt><dd className="tnum">{res.chargeMinutes ? formatDuration(res.chargeMinutes) : 'No hace falta'}</dd></div>
            <div><dt>Consumo</dt><dd className="tnum">{res.kwhPer100} kWh/100 km</dd></div>
          </dl>

          <figure className="chart" ref={box}>
            <figcaption>Batería durante el viaje Lima → {route.name} ({car.make} {car.model})</figcaption>
            <svg
              width={W}
              height={H + roadH}
              role="img"
              aria-label={`Gráfico de batería. ${headline}`}
              onPointerMove={(e) => {
                const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
                const km = ((e.clientX - r.left - pad.l) / iw) * route.km;
                setHover(km >= 0 && km <= endKm ? km : null);
              }}
              onPointerLeave={() => setHover(null)}
            >
              {[0, 25, 50, 75, 100].map((v) => (
                <g key={v}>
                  <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} className="chart__grid" />
                  <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" className="chart__axis tnum">{v}%</text>
                </g>
              ))}
              <line x1={pad.l} x2={W - pad.r} y1={y(RESERVE)} y2={y(RESERVE)} className="chart__reserve" />
              <text x={W - pad.r} y={y(RESERVE) - 6} textAnchor="end" className="chart__axis">Reserva {RESERVE} %</text>

              <path ref={lineRef} d={d} className="chart__line" />

              {res.stops.map((s) => (
                <g key={s.name}>
                  <circle cx={x(s.km)} cy={y(s.arrive)} r={5} className="chart__dot" />
                  <circle cx={x(s.km)} cy={y(s.leave)} r={5} className="chart__dot chart__dot--full" />
                  <text x={x(s.km)} y={y(s.leave) - 12} textAnchor="middle" className="chart__label">{s.name}</text>
                </g>
              ))}

              {hover !== null && hoverSoc !== null && (
                <g className="chart__hover">
                  <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} />
                  <circle cx={x(hover)} cy={y(hoverSoc)} r={5} />
                  <g transform={`translate(${Math.min(x(hover) + 10, W - 120)},${pad.t})`}>
                    <rect width="108" height="40" rx="6" />
                    <text x="10" y="17" className="tnum">km {Math.round(hover)}</text>
                    <text x="10" y="33" className="tnum">{Math.round(hoverSoc)} % batería</text>
                  </g>
                </g>
              )}

              {/* La carretera: asfalto, línea amarilla y los hitos kilométricos. */}
              <g transform={`translate(0,${H})`}>
                <rect x={pad.l} y={6} width={iw} height={26} rx={3} className="road" />
                <line x1={pad.l} x2={pad.l + iw} y1={19} y2={19} className="road__line" />
                {posts.map((k) => (
                  <g key={k} transform={`translate(${x(k)},0)`}>
                    <text y={45} textAnchor="middle" className="chart__axis tnum">{k}</text>
                  </g>
                ))}
                {res.stops.map((s) => (
                  <g key={s.name} transform={`translate(${x(s.km)},19)`}>
                    <circle r={8} className="road__plug" />
                    <path d="M-2.5,-4 L1,-0.5 L-1,-0.5 L2.5,4" className="road__bolt" />
                  </g>
                ))}
                <g transform={`translate(${pad.l},19)`}>
                  <g ref={carRef}>
                    <g transform="translate(-14,-8)">
                      <rect width="28" height="16" rx="5" className="road__car" />
                      <rect x="17" y="3" width="7" height="10" rx="2" className="road__glass" />
                    </g>
                  </g>
                </g>
              </g>
            </svg>
          </figure>

          {res.stops.length > 0 && (
            <ol className="stops" aria-label="Paradas de carga">
              {res.stops.map((s) => (
                <li key={s.name}>
                  <b>{s.name}</b> <span className="tnum">km {s.km}</span>
                  <span className="tnum">{Math.round(s.arrive)} % → {s.leave} %</span>
                  <span className="tnum">{s.minutes} min</span>
                </li>
              ))}
            </ol>
          )}
          <p className="note note--dark">Simulación referencial con cargadores de demostración. El consumo real depende del tráfico, el viento y la carga del auto.</p>
        </div>
      </div>
    </section>
  );
}
