import { waLink } from '@/lib/contact';

export default function Footer() {
  return (
    <footer className="ft">
      <div className="ft__sign">
        <div className="ft__inner">
          <p className="ft__exit">Salida · Showroom HITO</p>
          <p className="ft__addr">Av. República de Panamá 4120, Surquillo, Lima</p>
          <p className="ft__hours">Lunes a sábado, 9:00 a 19:00</p>
        </div>
      </div>
      <div className="ft__legal">
        <p>Diseño demo: HITO es un concesionario ficticio. Los modelos pertenecen a sus marcas; precios, cuotas, cargadores y disponibilidad son de ejemplo. ¿Quieres una web así para tu negocio? Fotos: <a href="https://www.pexels.com" rel="noopener">Pexels</a>.</p>
        <a className="badge" href={waLink('HITO (concesionario)')} target="_blank" rel="noopener">Diseño y desarrollo: Daniel Yataco · WhatsApp <span className="nowrap">975 118 790</span></a>
      </div>
    </footer>
  );
}
