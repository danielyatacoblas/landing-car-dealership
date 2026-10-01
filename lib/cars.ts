// Inventario de demostración. Autonomías WLTP aproximadas y referenciales; precios ficticios.
export type Body = 'SUV' | 'Crossover' | 'Sedán';
export type Car = {
  id: string;
  make: string;
  model: string;
  body: Body;
  battery: number; // kWh útiles
  range: number; // km WLTP
  seats: number;
  dcKw: number; // potencia máxima de carga rápida
  price: number; // USD
  img: string;
  alt: string;
};

export const CARS: Car[] = [
  { id: 'ioniq6', make: 'Hyundai', model: 'Ioniq 6', body: 'Sedán', battery: 77.4, range: 614, seats: 5, dcKw: 233, price: 56990, img: '/img/ioniq6.jpg', alt: 'Sedán eléctrico negro de perfil junto a un cargador en estudio.' },
  { id: 'ev9', make: 'Kia', model: 'EV9 GT-Line', body: 'SUV', battery: 99.8, range: 505, seats: 7, dcKw: 210, price: 89990, img: '/img/ev9.jpg', alt: 'SUV eléctrico de siete asientos visto de frente junto a un muro de concreto.' },
  { id: 'ioniq5', make: 'Hyundai', model: 'Ioniq 5', body: 'Crossover', battery: 77.4, range: 507, seats: 5, dcKw: 233, price: 54990, img: '/img/ioniq5.jpg', alt: 'Crossover eléctrico avanzando por una carretera del desierto al atardecer.' },
  { id: 'ev5', make: 'Kia', model: 'EV5', body: 'SUV', battery: 88, range: 500, seats: 5, dcKw: 140, price: 52990, img: '/img/ev5.jpg', alt: 'SUV eléctrico plateado bajo un alero de concreto.' },
  { id: 'gv60', make: 'Genesis', model: 'GV60', body: 'Crossover', battery: 77.4, range: 470, seats: 5, dcKw: 233, price: 69990, img: '/img/gv60.jpg', alt: 'Crossover eléctrico blanco iluminado sobre fondo negro.' },
  { id: 'niro', make: 'Kia', model: 'Niro EV', body: 'Crossover', battery: 64.8, range: 460, seats: 5, dcKw: 72, price: 41990, img: '/img/niro.jpg', alt: 'Crossover eléctrico negro sobre arena dorada frente a una duna.' },
  { id: 'gv70', make: 'Genesis', model: 'GV70 Electrified', body: 'SUV', battery: 77.4, range: 455, seats: 5, dcKw: 233, price: 79990, img: '/img/gv70.jpg', alt: 'SUV eléctrico azul oscuro en estudio con luz lateral.' },
  { id: 'kona', make: 'Hyundai', model: 'Kona Electric', body: 'SUV', battery: 64.8, range: 454, seats: 5, dcKw: 102, price: 39990, img: '/img/kona.jpg', alt: 'SUV compacto eléctrico blanco y gris sobre fondo azul.' },
];
