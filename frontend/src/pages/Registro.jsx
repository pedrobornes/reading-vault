import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Importado para navegación interna
import AuthService from '../services/Auth.service';
import '../assets/css/registro.css'; 
import '../assets/css/login.css'; // Importamos el CSS de login para usar los estilos del enlace

const Registro = () => {
    const navigate = useNavigate();
    // Estado inicial
    const [formData, setFormData] = useState({
        nombre: '', apellidos: '', fechaNacimiento: '',
        nombreUsuario: '', email: '', password: '', repetirPassword: ''
    });
    
    // Estado de errores
    const [errorMessage, setErrorMessage] = useState(''); 

    // Actualiza inputs y limpia errores
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrorMessage(''); 
    };

    // Validaciones en tiempo real
    const reqLength = formData.password.length >= 8;
    const reqUpper = /[A-Z]/.test(formData.password);
    const reqNum = /\d/.test(formData.password);

    // Valida y envía
    const handleRegister = async (e) => {
        e.preventDefault(); 

        // Regex
        const nameRegex = /^[a-zA-ZÀ-ÿ\s]{2,40}$/; 
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

        // Validaciones
        if (!nameRegex.test(formData.nombre) || !nameRegex.test(formData.apellidos)) {
            setErrorMessage("Nombre y apellidos deben contener al menos 2 letras y sin números.");
            return;
        }
        
        if (!formData.fechaNacimiento) {
            setErrorMessage("Debes introducir una fecha de nacimiento.");
            return;
        }

        if (formData.nombreUsuario.trim().length < 4) {
            setErrorMessage("El nombre de usuario debe tener al menos 4 caracteres.");
            return;
        }

        if (!emailRegex.test(formData.email)) {
            setErrorMessage("Introduce un correo electrónico válido.");
            return;
        }

        if (!reqLength || !reqUpper || !reqNum) {
            setErrorMessage("La contraseña no cumple todos los requisitos.");
            return;
        }

        if (formData.password !== formData.repetirPassword) {
            setErrorMessage("Las contraseñas no coinciden.");
            return;
        }

        try {
            // Envío al backend
            const response = await AuthService.register(formData);
            
            // Lógica de Login Automático
            if (response.data && response.data.token) {
                // Si el backend devuelve token tras registrar, guardamos sesión
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("usuario", JSON.stringify(response.data.user));
                
                // Redirección directa a Home
                window.location.href = "/home";
            } else {
                // Fallback: si no hay token automático, enviamos al login manual
               window.location.href = "/login";
            }
        } catch (error) {
            setErrorMessage("Error al conectar con el servidor o el usuario ya existe.");
        }
    };

    return (
        <div className="registro-page">
            <div className="registro-panel">
                <div className="registro-logo-container">
                    <img src="/img/logo-vault.png" alt="Logo Reading Vault" className="registro-logo" />
                </div>
                
                <form onSubmit={handleRegister} className="registro-form">
                    <div className="registro-grid">
                        <div className="registro-form-group">
                            <label className="registro-label">Nombre</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="registro-input" required />
                        </div>
                        
                        <div className="registro-form-group">
                            <label className="registro-label">Apellidos</label>
                            <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} className="registro-input" required />
                        </div>

                        <div className="registro-form-group">
                            <label className="registro-label">Fecha de nacimiento</label>
                            <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} className="registro-input" required />
                        </div>
                        
                        <div className="registro-form-group hidden-mobile"></div>

                        <div className="registro-form-group">
                            <label className="registro-label">Nombre de usuario</label>
                            <input type="text" name="nombreUsuario" value={formData.nombreUsuario} onChange={handleChange} className="registro-input" required />
                        </div>

                        <div className="registro-form-group">
                            <label className="registro-label">Correo electrónico</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="registro-input" required />
                        </div>

                        <div className="registro-form-group">
                            <label className="registro-label">Contraseña</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} className="registro-input" required />
                                                                                
                            {formData.password.length > 0 && (
                            <div className="registro-hints">
                                <span className={reqLength ? "hint-met" : "hint-unmet"}>
                                    {reqLength ? "✅" : "❌"} Mínimo 8 caracteres
                                </span><br></br>
                                <span className={reqUpper ? "hint-met" : "hint-unmet"}>
                                    {reqUpper ? "✅" : "❌"} Una letra mayúscula
                                </span><br></br>
                                <span className={reqNum ? "hint-met" : "hint-unmet"}>
                                    {reqNum ? "✅" : "❌"} Un número
                                </span>
                            </div>
                        )}
                        </div>
                        <div className="registro-form-group">
                            <label className="registro-label">Repetir contraseña</label>
                            <input type="password" name="repetirPassword" value={formData.repetirPassword} onChange={handleChange} className="registro-input" required />
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="registro-error-msg">
                            {errorMessage}
                        </div>
                    )}

                    <button type="submit" className="registro-button">Registrarse</button>

                    <div className="register-redirect">
                        <span>¿Ya tienes una cuenta?</span>
                        <Link to="/login" className="register-link">Inicia sesión aquí</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Registro;