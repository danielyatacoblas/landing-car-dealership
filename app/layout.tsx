import type { Metadata, Viewport } from 'next';
import { Overpass } from 'next/font/google';
import './globals.css';

// Overpass deriva de Highway Gothic, la tipografía de las señales de carretera.
const overpass = Overpass({ subsets: ['latin'], variable: '--font-sign', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://landing-car-dealership-danielyatacoblas-projects.vercel.app'),
  title: 'HITO — Autos eléctricos que llegan a donde vas',
  description: 'Concesionario de autos eléctricos en Lima. Simula tu ruta por la Panamericana, calcula tu cuota y agenda un test drive. Demo de portafolio de Daniel Yataco.',
  openGraph: { title: 'HITO — Autos eléctricos que llegan', description: '¿Llegas a Paracas sin cargar? Simúlalo.', images: ['/img/hero.jpg'] },
};

export const viewport: Viewport = { themeColor: '#0b6b43', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={overpass.variable}>
      <body>{children}</body>
    </html>
  );
}
