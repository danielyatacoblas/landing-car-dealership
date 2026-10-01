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
        <p>HITO es un concesionario ficticio creado para portafolio. Los modelos pertenecen a sus marcas; precios, cuotas, cargadores y disponibilidad son de demostración. Fotos: <a href="https://www.pexels.com" rel="noopener">Pexels</a>.</p>
        <a className="badge" href="https://github.com/danielyatacoblas" rel="noopener">Diseñado y desarrollado por Daniel Yataco</a>
      </div>
    </footer>
  );
}
