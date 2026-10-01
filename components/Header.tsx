'use client';
import { useEffect, useState } from 'react';

export default function Header() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 60);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header className="hd" data-solid={solid ? '' : undefined}>
      <a href="#top" className="plate" aria-label="HITO, volver al inicio">HITO</a>
      <nav className="hd__nav" aria-label="Principal">
        <a href="#inventario">Autos</a>
        <a href="#ruta">Simular ruta</a>
        <a href="#cuota">Cuota</a>
      </nav>
      <a href="#test-drive" className="btn btn--sign btn--sm">Test drive</a>
    </header>
  );
}
