import { Link } from 'react-router-dom';
import '../assets/css/footer.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function Footer() {
    return (
        <footer className="footer-custom">
            <div className="container">
                <div className="row align-items-center">
                    
                    {/* IZQUIERDA: Titulo, slogan y redes */}
                    <div className="col-md-4 text-center text-md-start mb-4 mb-md-0">
                        <h2 className="fw-bold fs-1">
                            <span style={{ color: "var(--color-verde-oscuro)" }}>Reading</span> <span style={{ color: "var(--color-amarillo)" }}>Vault</span>
                        </h2>
                        <p className="mt-3 slogan__descripcion">
                            Tu refugio personal para cada libro que formará parte de tu viaje literario
                        </p>
                        <div className="d-flex gap-3 justify-content-center justify-content-md-start mt-4">
                            <a href="#" className="footer__social-icon"><i className="bi bi-facebook"></i></a>
                            <a href="#" className="footer__social-icon"><i className="bi bi-twitter-x"></i></a>
                            <a href="#" className="footer__social-icon"><i className="bi bi-instagram"></i></a>
                        </div>
                    </div>

                    {/* CENTRO: Logo circular */}
                    <div className="col-md-4 text-center mb-4 mb-md-0">
                        <div className="footer__logo-circle">
                            <img 
                                src="/img/logo-vault.png" 
                                alt="logo" 
                                className="footer__logo-img"
                            />
                        </div>
                    </div>

                    {/* DERECHA: Enlaces en dos minicolumnas */}
                    <div className="col-md-4">
                        <div className="row">
                            <div className="col-6 text-center text-md-start">
                                <h4 className="footer__column-title">ReadingVault</h4>
                                <ul className="footer__list">
                                    <li><Link to="/buscador" className="footer__link">Explorar libros</Link></li>
                                    <li><Link to="/manual" className="footer__link">Manual de uso</Link></li>
                                </ul>
                            </div>
                            <div className="col-6 text-center text-md-start">
                                <h4 className="footer__column-title">Comunidad</h4>
                                <ul className="footer__list">
                                    <li><Link to="/comunidad" className="footer__link">Grupos de lectura</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LINEA Y LEGAL (ABAJO) */}
                <hr className="footer__divider" />
                <div className="row justify-content-center text-center footer__bottom-row derechos">
                    ©2026. Todos los derechos reservados
                </div>
            </div>
        </footer>
    );
}