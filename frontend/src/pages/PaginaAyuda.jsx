import React from 'react';

export default function PaginaAyuda() {
    return (
        <div className="container-custom py-5">
            <h1 className="text-center mb-5">
                Centro de Ayuda - <span style={{ color: "var(--color-verde-oscuro)" }}>Reading</span> 
                <span style={{ color: "var(--color-amarillo)" }}>Vault</span>
            </h1>
            
            <div className="home-grid__main">
                {/* 1. Búsqueda y Enriquecimiento */}
                <section className="noticia-card mb-4">
                    <h2 className="noticia-titulo-principal">1. Búsqueda y Gestión</h2>
                    <p className="noticia-contenido">
                        Aprende a navegar por nuestra plataforma para encontrar y organizar tus lecturas de forma eficiente:
                    </p>
                    
                    <ul className="noticia-contenido" style={{ listStyleType: "none", paddingLeft: "0" }}>
                        <li className="mb-3">
                            <i className="bi bi-1-circle-fill me-2" style={{ color: "var(--color-salmon)" }}></i>
                            <strong>Explora por géneros:</strong> En la barra lateral izquierda, haz clic en cualquier género para filtrar por ese género y encontrar tu próxima lectura.
                        </li>
                        <li className="mb-3">
                            <i className="bi bi-2-circle-fill me-2" style={{ color: "var(--color-salmon)" }}></i>
                            <strong>Buscador de libros:</strong> Usa la barra central para buscar por título o autor y accede instantáneamente a la ficha técnica de la obra.
                        </li>
                        <li className="mb-3">
                            <i className="bi bi-3-circle-fill me-2" style={{ color: "var(--color-salmon)" }}></i>
                            <strong>Ordena resultados:</strong> Tras realizar una búsqueda, usa el selector de ordenación para organizar los libros por <strong style={{ color: "var(--color-salmon)" }}>Mejor valorados</strong> o <strong style={{ color: "var(--color-salmon)" }}>Relevancia</strong>.
                        </li>
                        <li className="mb-3">
                            <i className="bi bi-4-circle-fill me-2" style={{ color: "var(--color-salmon)" }}></i>
                            <strong>Gestiona tu estantería:</strong> Marca tus libros como <strong style={{ color: "var(--color-salmon)" }}><em>Pendientes</em></strong>, <strong style={{ color: "var(--color-salmon)" }}><em>Leyendo</em></strong> o <strong style={{ color: "var(--color-salmon)" }}><em>Leídos</em></strong> desde las tarjetas. ¡Y recuerda que puedes hacer clic en cualquier libro para consultar su página de detalle!
                        </li>
                    </ul>

                    <div className="text-center my-4">
                        <img src="/img/ayuda1.png" alt="Buscador" className="img-fluid rounded shadow-sm" />
                    </div>
                </section>

                {/* 2. Estantería y Progreso */}
                <section className="noticia-card mb-4">
                    <h2 className="noticia-titulo-principal">2. Gestionando tu Estantería</h2>
                    <p className="noticia-contenido">
                        Mantener tu biblioteca organizada es sencillo. Clasifica tus libros según tu progreso:
                    </p>
                    
                    <ul className="noticia-contenido" style={{ listStyleType: "none", paddingLeft: "0" }}>
                        <li className="mb-3">
                            <i className="bi bi-bookmark-fill me-2" style={{ color: "var(--color-salmon)" }}></i>
                            <strong>Pendientes:</strong> Libros que esperas leer en el futuro.
                        </li>
                        <li className="mb-3">
                            <i className="bi bi-book-half me-2" style={{ color: "var(--color-salmon)" }}></i>
                            <strong>Leyendo:</strong> Al mover un libro aquí, se activa el contador de páginas. Puedes actualizar tu avance fácilmente haciendo clic en la barra de progreso en tu <strong style={{ color: "var(--color-salmon)" }}>Panel Principal</strong>.
                        </li>
                        <li className="mb-3">
                            <i className="bi bi-check-circle-fill me-2" style={{ color: "var(--color-salmon)" }}></i>
                            <strong>Leídos:</strong> Al marcar un libro como leído, se desbloquea la opción de añadir una <strong>reseña y valoración</strong>, que será visible para tu red de amigos.
                        </li>
                    </ul>
                </section>

                {/* 3. Reto Anual */}
                <section className="noticia-card mb-4">
                    <h2 className="noticia-titulo-principal">3. El Reto Anual</h2>
                    <p className="noticia-contenido">
                        ¿Quieres ponerte a prueba? El <strong style={{ color: "var(--color-salmon)" }}>Reto Anual</strong> te ayuda a mantener la constancia en tus lecturas.
                    </p>

                    <ul className="noticia-contenido" style={{ listStyleType: "none", paddingLeft: "0" }}>
                        <li className="mb-2">
                            <i className="bi bi-1-circle-fill me-2" style={{ color: "var(--color-salmon)" }}></i>
                            <strong>Objetivo:</strong> Define cuántos libros quieres leer este año.
                        </li>
                        <li className="mb-2">
                            <i className="bi bi-2-circle-fill me-2" style={{ color: "var(--color-salmon)" }}></i>
                            <strong>Progreso visual:</strong> La barra dinámica que muestra cuánto te falta para alcanzar tu meta.
                        </li>
                        <li className="mb-2">
                            <i className="bi bi-3-circle-fill me-2" style={{ color: "var(--color-salmon)" }}></i>
                            <strong>Acceso rápido:</strong> Tu progreso se actualiza automáticamente cada vez que finalizas un libro desde tu <strong style={{ color: "var(--color-salmon)" }}>Panel Central</strong>.
                        </li>
                    </ul>

                    <div className="text-center my-4">
                        <img src="/img/ayuda2.png" alt="Reto Anual" className="img-fluid rounded shadow-sm border" />
                    </div>
                </section>

                {/* 4. Comunidad y Amigos */}
                <section className="noticia-card mb-4">
                    <h2 className="noticia-titulo-principal">4. Comunidad y Amistades</h2>
                    <p className="noticia-contenido">
                        Reading Vault no es un viaje solitario. Conecta con otros lectores y comparte tu pasión literaria:
                    </p>

                    {/* Bloque 1: Lista de amigos */}
                    <div className="mb-4">
                        <h4 className="noticia-titulo-secundario">
                            <i className="bi bi-people-fill me-2" style={{ color: "var(--color-salmon)" }}></i>
                            Lista de amigos
                        </h4>
                        <p className="noticia-contenido">
                            Aquí encontrarás a todos tus amigos. Puedes visitar sus perfiles para consultar sus estanterías públicas, ver sus últimas lecturas y descubrir sus reseñas.
                        </p>
                        <div className="text-center my-3">
                            <img src="/img/ayuda3.png" alt="Amigos" className="img-fluid rounded shadow-sm border" />
                        </div>
                    </div>
                    
                    <hr />

                    {/* Bloque 2: Grupos y Recomendaciones */}
                    <div className="mb-4">
                        <h4 className="noticia-titulo-secundario">
                            <i className="bi bi-chat-dots-fill me-2" style={{ color: "var(--color-salmon)" }}></i>
                            Grupos y Recomendaciones
                        </h4>
                        <ul className="noticia-contenido" style={{ listStyleType: "none", paddingLeft: "0" }}>
                            <li className="mb-3">
                                <i className="bi bi-1-circle-fill me-2" style={{ color: "var(--color-salmon)" }}></i>
                                <strong>Gestión de grupos y usuarios:</strong> Crea tus propios grupos de lectura o utiliza el buscador para encontrar comunidades según tus intereses. También puedes buscar usuarios por su nombre de usuario.
                            </li>
                            <li className="mb-3">
                                <i className="bi bi-2-circle-fill me-2" style={{ color: "var(--color-salmon)" }}></i>
                                <strong>Únete y debate:</strong> Entra en cualquier grupo para unirte a la conversación. Participa en el <strong style={{ color: "var(--color-salmon)" }}>Muro de grupo</strong> para chatear con otros miembros.
                            </li>
                        </ul>
                        <div className="text-center my-4">
                            <img src="/img/ayuda4.png" alt="Grupos de lectura" className="img-fluid rounded shadow-sm border" />
                        </div>
                    </div>
                </section>

                {/* 5. Reseñas */}
                <section className="noticia-card mb-4">
                    <h2 className="noticia-titulo-principal">5. Reseñas y Valoraciones</h2>
                    <p className="noticia-contenido">
                        Tu opinión es fundamental para la comunidad. Comparte tu experiencia al terminar un libro siguiendo estos pasos:
                    </p>

                    <ul className="noticia-contenido" style={{ listStyleType: "none", paddingLeft: "0" }}>
                        <li className="mb-4">
                            <i className="bi bi-1-circle-fill me-2" style={{ color: "var(--color-salmon)" }}></i>
                            <strong>Valora tu lectura:</strong> Cuando marques un libro como "Leído", se activará automáticamente el panel de puntuación. Selecciona de 1 a 5 estrellas para dejar tu nota personal.
                        </li>
                        <li className="mb-4">
                            <i className="bi bi-2-circle-fill me-2" style={{ color: "var(--color-salmon)" }}></i>
                            <strong>Publica tu reseña:</strong> Una vez valorado, podrás escribir un breve comentario sobre tu experiencia. Tu reseña aparecerá en la sección de "Valoraciones y reseñas" del libro, donde podrás editarla o borrarla cuando quieras.
                        </li>
                    </ul>

                    <div className="text-center my-4">
                        <img src="/img/ayuda5.png" alt="Reseñas y Valoraciones" className="img-fluid rounded shadow-sm border" />
                    </div>
                </section>

                {/* FAQ detallada */}
                <section className="noticia-card bg-light">
                    <h3 className="noticia-titulo-principal">Preguntas Frecuentes (FAQ)</h3>
                    <div className="noticia-contenido">
                        <p><strong>¿Mis datos son públicos?</strong><br />
                        Por defecto, tu perfil es visible para la comunidad, pero puedes configurar la privacidad en la sección 
                        <strong style={{ color: "var(--color-salmon)" }}> Ajustes de Cuenta</strong>. 
                        Si activas el modo privado, solo tus amigos podrán ver los detalles de tu estantería.</p>
                        
                        <p><strong>¿Puedo cambiar mi contraseña o correo?</strong><br />
                        ¡Por supuesto! Dirígete a <strong style={{ color: "var(--color-salmon)" }}>Ajustes de Cuenta</strong>. 
                        Allí podrás actualizar tus credenciales de acceso de forma segura en cualquier momento.</p>
                        
                        <p><strong>¿Cómo puedo borrar mi cuenta?</strong><br />
                        Si decides cerrar tu etapa en Reading Vault, puedes solicitar la eliminación definitiva de tu perfil y todos tus datos asociados en la parte inferior de <strong style={{ color: "var(--color-salmon)" }}>Ajustes de Cuenta</strong>. 
                        Ten en cuenta que esta acción es irreversible.</p>
                        
                        <p>
                            <strong>¿La aplicación es gratuita?</strong>
                            <br />
                            Sí, <span style={{ color: "var(--color-verde-oscuro)", fontWeight: "bold" }}>Reading</span>
                            <span style={{ 
                                color: "var(--color-amarillo)", 
                                fontWeight: "bold", 
                                textShadow: "0px 1px 2px rgba(0, 0, 0, 0.55)" 
                            }}>
                                Vault
                            </span>{" "}
                            es una plataforma gratuita para todos los amantes de la literatura. Nuestro objetivo es centralizar tu viaje lector sin costes adicionales.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}