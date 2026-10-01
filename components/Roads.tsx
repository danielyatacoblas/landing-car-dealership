'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap, reduced } from '@/lib/motion';

const SHOTS = [
  { src: '/img/acantilado.jpg', alt: 'Camioneta blanca al borde de un acantilado en la costa desértica.', place: 'Paracas', km: 250 },
  { src: '/img/ev9-playa.jpg', alt: 'SUV eléctrico gris estacionado sobre la arena de una playa.', place: 'Asia', km: 97 },
  { src: '/img/ruta-postes.jpg', alt: 'Carretera curva entre postes de luz y arena bajo cielo celeste.', place: 'Pampa de Villacurí', km: 270 },
  { src: '/img/desierto.jpg', alt: 'Sedán blanco detenido junto a cerros áridos.', place: 'Nazca', km: 450 },
  { src: '/img/carga.jpg', alt: 'SUV gris conectado a un cargador público en un estacionamiento.', place: 'Cañete', km: 145 },
  { src: '/img/dunas.jpg', alt: 'SUV levantando arena entre dunas al atardecer.', place: 'Huacachina', km: 305 },
];

export default function Roads() {
  const root = useRef<HTMLElement>(null);
  const row = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!root.current || !row.current || reduced()) return;
    const ctx = gsap.context(() => {
      // La fila avanza con el scroll como el paisaje por la ventana.
      gsap.fromTo(row.current, { x: 0 }, {
        x: () => -(row.current!.scrollWidth - window.innerWidth) * 0.6, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.5, invalidateOnRefresh: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="roads" ref={root} aria-labelledby="roads-title">
      <h2 id="roads-title">La costa entera es nuestra pista de prueba</h2>
      <ul className="roads__row" ref={row}>
        {SHOTS.map((s) => (
          <li key={s.src} className="shot">
            <Image src={s.src} alt={s.alt} fill sizes="(max-width: 700px) 80vw, 34vw" quality={72} />
            <p><span>{s.place}</span><span className="tnum">km {s.km}</span></p>
          </li>
        ))}
      </ul>
    </section>
  );
}
