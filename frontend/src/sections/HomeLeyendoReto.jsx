import { Link } from 'react-router-dom';

export default function HomeLeyendoReto() {

    return(
        <section className="infoUsuario">
            <div className="leyendo">
                <h3 className="leyendo__titulo">Leyendo actualmente</h3>
                <div className="leyendo__libro">
                    <picture className="libro__picture">
                        <img src="" alt="" className="libro__portada"/>
                    </picture>
                    <div className="libro__info">
                        <h4 className="libro__titulo"></h4>
                        <h4 className="libro__escritor"></h4>
                        <div className="libro__progreso">
                            <h4 className="progreso__actual"></h4>
                            <div className="progreso__barra"></div>
                        </div>
                    </div>
                    
                </div>
                <div className="leyendo__perfil">
                    <Link to="/perfilUsuario" className="perfil__boton">Ir a mi perfil</Link>
                </div>
            </div>

            <div className="reto">
                <h3 className="leyendo__titulo">Reto del año</h3>
                <h4 className="libro__progreso"></h4>
                <div className="reto__barra"></div>
                <Link to="/reto">ir a mi reto</Link>
            </div>
        </section>
    )
}