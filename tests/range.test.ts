import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simulate, ROUTES, consumption, RESERVE } from '../lib/range.ts';
import { installment } from '../lib/finance.ts';
import { CARS } from '../lib/cars.ts';

const route = (id: string) => ROUTES.find((r) => r.id === id)!;
const car = (id: string) => CARS.find((c) => c.id === id)!;
const base = { startSoc: 100, speed: 100 as const, ac: true };

test('Paracas no necesita cargar con autonomía larga', () => {
  const r = simulate(car('ioniq6'), route('paracas'), base);
  assert.equal(r.ok, true);
  assert.equal(r.stops.length, 0);
  assert.ok(r.arrival > 40);
});

test('Arequipa obliga a parar y nunca baja de la reserva', () => {
  const r = simulate(car('kona'), route('arequipa'), base);
  assert.equal(r.ok, true);
  assert.ok(r.stops.length >= 2);
  for (const p of r.points) assert.ok(p.soc >= RESERVE - 0.01, `${p.label} quedó en ${p.soc}`);
});

test('ir a 120 km/h consume más que a 100 km/h', () => {
  const a = consumption(77.4, 507, { speed: 100, ac: false });
  const b = consumption(77.4, 507, { speed: 120, ac: false });
  assert.ok(b > a * 1.15);
});

test('con poca carga inicial y sin estaciones útiles se queda sin margen', () => {
  const r = simulate(car('niro'), { id: 'x', name: 'X', km: 600, climb: 1, stations: [] }, { ...base, startSoc: 50 });
  assert.equal(r.ok, false);
  assert.ok(r.strandedKm !== null && r.strandedKm < 600);
});

test('la subida a la sierra gasta más batería que un tramo plano de igual distancia', () => {
  const tramo = { id: 't', name: 'T', km: 300, stations: [] };
  const sierra = simulate(car('ev9'), { ...tramo, climb: 1.18 }, base);
  const plano = simulate(car('ev9'), { ...tramo, climb: 1 }, base);
  assert.ok(sierra.kwhPer100 > plano.kwhPer100);
  assert.ok(sierra.arrival < plano.arrival);
});

test('cuota del sistema francés', () => {
  const r = installment(40000, 20, 48, 12);
  assert.equal(r.principal, 32000);
  assert.ok(r.cuota > 830 && r.cuota < 850, String(r.cuota));
  assert.equal(r.down, 8000);
  assert.equal(installment(12000, 0, 12, 0).cuota, 1000);
});
