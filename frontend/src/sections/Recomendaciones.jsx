export default function Recomendaciones() {
  return (
    <section className="recomendaciones">
      {/* recomendacion de amigo */}
      <div className="recomendacion">
        <h3 className="recomendacion__titulo">¡Te recomendamos!</h3>
        <picture className="recomendacion__picture">
          <img src="" alt="portada" className="recomendacion__portada" />
        </picture>
        <h4 className="recomendacion__libro"></h4>
        <h4 className="recomendacion__autor"></h4>
        <p className="recomendacion__amigo">Recomendación de tu amigo </p>
        <div className="recomendacion__boton">
          <a href="" className="recomendacion__enlace">
            Recomendaciones de tus amigos
          </a>
        </div>
      </div>

      {/* reto del año */}
      <div className="libroAño">
        <h3 className="recomendacion__titulo">¡Libro del año!</h3>
        <picture className="recomendacion__picture">
          <img src="" alt="portada" className="recomendacion__portada" />
        </picture>
        <h4 className="recomendacion__libro"></h4>
        <h4 className="recomendacion__autor"></h4>
        <div className="recomendacion__boton">
          <a href="" className="recomendacion__enlace">
            Ver más recomendaciones ReadingVault
          </a>
        </div>
      </div>
    </section>
  );
}
