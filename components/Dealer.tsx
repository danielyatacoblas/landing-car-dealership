'use client';
import { useCallback, useEffect, useState } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, reduced } from '@/lib/motion';
import Header from './Header';
import Hero from './Hero';
import Inventory from './Inventory';
import Simulator from './Simulator';
import Finance from './Finance';
import Roads from './Roads';
import TestDrive from './TestDrive';
import Footer from './Footer';

export default function Dealer() {
  const [carId, setCarId] = useState('ioniq5');
  const [routeId, setRouteId] = useState('ica');

  useEffect(() => {
    if (reduced()) return;
    const lenis = new Lenis({ duration: 1.05 });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); };
  }, []);

  const goTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  }, []);

  return (
    <>
      <a href="#inventario" className="skip">Saltar al inventario</a>
      <Header />
      <main>
        <Hero onRoute={(r) => { setRouteId(r); goTo('ruta'); }} />
        <Inventory selected={carId} onSimulate={(c) => { setCarId(c); goTo('ruta'); }} onFinance={(c) => { setCarId(c); goTo('cuota'); }} />
        <Simulator carId={carId} routeId={routeId} onCar={setCarId} onRoute={setRouteId} />
        <Finance carId={carId} onCar={setCarId} />
        <Roads />
        <TestDrive carId={carId} />
      </main>
      <Footer />
    </>
  );
}
