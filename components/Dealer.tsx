'use client';
import { useCallback, useEffect, useState } from 'react';
import { reduced } from '@/lib/motion';
import { startSmoothScroll } from '@/lib/smooth';
import DemoCta from './DemoCta';
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

  useEffect(() => startSmoothScroll(), []);

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
      <DemoCta site="HITO (concesionario)" />
    </>
  );
}
