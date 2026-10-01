'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap, reduced } from '@/lib/motion';
import { ROUTES } from '@/lib/range';

const SIGN = ['paracas', 'ica', 'huaraz', 'arequipa'];

function Arrow({ dir }: { dir: 'up' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" style={{ transform: dir === 'right' ? 'rotate(45deg)' : undefined }}>
      <path d="M12 3 L20 12 H15 V21 H9 V12 H4 Z" fill="currentColor" />
    </svg>
  );
}

export default function Hero({ onRoute }: { onRoute: (id: string) => void }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!root.current || reduced()) return;
    const ctx = gsap.context(() => {
      // La señal se acerca como cuando manejas hacia ella: de lejos y desenfocada a nítida.
      gsap.from('.sign', { scale: 0.55, y: -40, filter: 'blur(6px)', opacity: 0, duration: 1.6, ease: 'expo.out', delay: 0.15 });
      gsap.from('.sign__row', { x: -16, opacity: 0, duration: 0.8, stagger: 0.07, ease: 'expo.out', delay: 0.9 });
      gsap.from('.hero__foot > *', { y: 20, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out', delay: 1.1 });
      gsap.to('.hero__img', { scale: 1.12, yPercent: 6, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.sign', { yPercent: -30, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" id="top" ref={root} aria-labelledby="hero-title">
      <Image className="hero__img" src="/img/hero.jpg" alt="Carretera recta en el desierto con torres de alta tensión a ambos lados." fill priority sizes="100vw" quality={80} />
      <div className="hero__shade" aria-hidden="true" />

      <div className="sign">
        <div className="sign__inner">
          <h1 id="hero-title" className="sign__title">Eléctricos que llegan a donde vas.</h1>
          <ul className="sign__rows" aria-label="Simular ruta desde Lima">
            {SIGN.map((id, i) => {
              const r = ROUTES.find((x) => x.id === id)!;
              return (
                <li key={id}>
                  <button type="button" className="sign__row" onClick={() => onRoute(id)}>
                    <Arrow dir={i === 2 ? 'right' : 'up'} />
                    <span className="sign__dest">{r.name}</span>
                    <span className="sign__km tnum">{r.km.toLocaleString('es-PE')} km</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="hero__foot">
        <p>Ocho modelos con autonomía real de 450 a 610 km. Elige un destino en la señal y te decimos si llegas, dónde cargar y cuánto tardas.</p>
        <div className="hero__ctas">
          <a href="#inventario" className="btn btn--light">Ver los 8 autos</a>
          <a href="#ruta" className="btn btn--ghost">Simular mi ruta</a>
        </div>
      </div>
    </section>
  );
}
