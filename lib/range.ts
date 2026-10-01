// Simulador de autonomía en ruta: decide dónde cargar y con cuánta batería llegas.
// Funciones puras, sin dependencias, para poder probarlas con node:test.

export type Station = { name: string; km: number };
export type Route = { id: string; name: string; km: number; climb: number; stations: Station[] };

const SUR: Station[] = [
  { name: 'Asia', km: 97 }, { name: 'Cañete', km: 145 }, { name: 'Paracas', km: 250 }, { name: 'Ica', km: 303 },
  { name: 'Nazca', km: 450 }, { name: 'Chala', km: 620 }, { name: 'Camaná', km: 845 },
];
const NORTE: Station[] = [
  { name: 'Huacho', km: 150 }, { name: 'Barranca', km: 200 }, { name: 'Casma', km: 370 }, { name: 'Chimbote', km: 430 },
  { name: 'Trujillo', km: 560 }, { name: 'Pacasmayo', km: 660 }, { name: 'Chiclayo', km: 770 }, { name: 'Piura', km: 980 },
];

// Estaciones de carga referenciales para la demo.
export const ROUTES: Route[] = [
  { id: 'paracas', name: 'Paracas', km: 250, climb: 1, stations: SUR },
  { id: 'ica', name: 'Ica', km: 303, climb: 1, stations: SUR },
  { id: 'nazca', name: 'Nazca', km: 450, climb: 1, stations: SUR },
  { id: 'trujillo', name: 'Trujillo', km: 560, climb: 1, stations: NORTE },
  { id: 'huaraz', name: 'Huaraz', km: 400, climb: 1.18, stations: [{ name: 'Barranca', km: 200 }, { name: 'Conococha', km: 330 }] },
  { id: 'arequipa', name: 'Arequipa', km: 1010, climb: 1.06, stations: SUR },
  { id: 'mancora', name: 'Máncora', km: 1150, climb: 1, stations: NORTE },
];

export type Options = { startSoc: number; speed: 100 | 120; ac: boolean };
export type Stop = { name: string; km: number; arrive: number; leave: number; minutes: number };
export type Point = { km: number; soc: number; label: string };
export type Result = {
  ok: boolean;
  arrival: number; // % al llegar (o al quedarse sin margen)
  strandedKm: number | null;
  stops: Stop[];
  chargeMinutes: number;
  driveMinutes: number;
  kwhPer100: number;
  points: Point[];
};

export const RESERVE = 10;
export const TARGET = 80;
const DC_CAP = 150; // kW: la mayoría de cargadores de ruta en Perú no pasan de aquí

const round1 = (n: number) => Math.round(n * 10) / 10;

export function consumption(battery: number, range: number, o: Pick<Options, 'speed' | 'ac'>, climb = 1) {
  const speedFactor = o.speed === 120 ? 1.28 : 1.08;
  return (battery / range) * 100 * speedFactor * (o.ac ? 1.05 : 1) * climb;
}

export function simulate(car: { battery: number; range: number; dcKw: number }, route: Route, o: Options): Result {
  const kwh100 = consumption(car.battery, car.range, o, route.climb);
  const drop = (km: number) => ((km * kwh100) / 100 / car.battery) * 100; // % de batería por tramo
  const power = Math.min(car.dcKw, DC_CAP) * 0.7; // potencia media real con la curva de carga

  const waypoints = [...route.stations.filter((s) => s.km > 0 && s.km < route.km), { name: route.name, km: route.km }];
  let pos = 0;
  let soc = o.startSoc;
  const points: Point[] = [{ km: 0, soc, label: 'Lima' }];
  const stops: Stop[] = [];

  for (let i = 0; i < waypoints.length; i++) {
    const wp = waypoints[i];
    const at = soc - drop(wp.km - pos);
    if (at < RESERVE) {
      const reach = pos + ((soc - RESERVE) / 100) * car.battery / kwh100 * 100;
      points.push({ km: round1(reach), soc: RESERVE, label: 'Sin margen' });
      return finish(false, RESERVE, round1(reach));
    }
    pos = wp.km;
    soc = at;
    points.push({ km: pos, soc: round1(soc), label: wp.name });
    if (i === waypoints.length - 1) break;

    const next = waypoints[i + 1];
    if (soc - drop(next.km - pos) >= RESERVE) continue;
    // Cargar solo lo necesario para el siguiente tramo largo, mínimo hasta 80 %.
    const needed = drop(next.km - pos) + RESERVE;
    const target = Math.min(100, Math.max(TARGET, Math.ceil(needed)));
    const minutes = Math.round((((target - soc) / 100) * car.battery / power) * 60);
    stops.push({ name: wp.name, km: pos, arrive: round1(soc), leave: target, minutes });
    soc = target;
    points.push({ km: pos, soc, label: `Carga en ${wp.name}` });
  }
  return finish(true, round1(soc), null);

  function finish(ok: boolean, arrival: number, strandedKm: number | null): Result {
    const chargeMinutes = stops.reduce((s, x) => s + x.minutes, 0);
    const driven = strandedKm ?? route.km;
    const driveMinutes = Math.round((driven / (o.speed * 0.82)) * 60);
    return { ok, arrival, strandedKm, stops, chargeMinutes, driveMinutes, kwhPer100: round1(kwh100), points };
  }
}

export function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} h ${String(m).padStart(2, '0')} min` : `${m} min`;
}
