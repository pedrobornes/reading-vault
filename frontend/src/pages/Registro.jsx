import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/Auth.service';
import { API_BASE_URL } from '../apiConfig';
import '../assets/css/registro.css'; 
import '../assets/css/login.css';
import Loader from '../components/Loader';

const Registro = () => {
    const navigate = useNavigate();
    
    // Controla si el formulario se está enviando para mostrar el spinner
    const [cargando, setCargando] = useState(false);
    // Datos del formulario
    const [formData, setFormData] = useState({
        nombre: '', apellidos: '', fechaNacimiento: '',
        nombreUsuario: '', email: '', password: '', repetirPassword: ''
    });
    // Mensaje de error para mostrar al usuario
    const [errorMessage, setErrorMessage] = useState(''); 

    // Manejador de cambios en inputs: limpia errores al escribir
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrorMessage(''); 
    };

    // --- VALIDACIONES DE CONTRASEÑA EN TIEMPO REAL ---
    const reqLength = formData.password.length >= 8;
    const reqUpper = /[A-Z]/.test(formData.password);
    const reqNum = /\d/.test(formData.password);

    const handleRegister = async (e) => {
        e.preventDefault(); 
        setCargando(true);

        const nameRegex = /^[a-zA-ZÀ-ÿ\s]{2,40}$/; 
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
        const hoy = new Date();
        const fechaMinima = new Date("1900-01-01");
        const fechaNacimiento = new Date(formData.fechaNacimiento);

        // Validaciones de formato
        if (!nameRegex.test(formData.nombre) || !nameRegex.test(formData.apellidos)) {
            setErrorMessage("Nombre y apellidos deben contener al menos 2 letras y sin números.");
            setCargando(false);
            return;
        }
        
        // Validación de fecha de nacimiento
        if (!formData.fechaNacimiento) {
            setErrorMessage("Debes introducir una fecha de nacimiento.");
            setCargando(false);
            return;
        }

        // Validar que no sea futura
        if (fechaNacimiento > hoy) {
            setErrorMessage("La fecha de nacimiento no puede ser una fecha futura.");
            setCargando(false);
            return;
        }

        // Validar fecha mínima
        if (fechaNacimiento < fechaMinima) {
            setErrorMessage("Por favor, introduce una fecha de nacimiento válida (posterior a 1900).");
            setCargando(false);
            return;
        }

        // Validación de usuario
        if (formData.nombreUsuario.trim().length < 4) {
            setErrorMessage("El nombre de usuario debe tener al menos 4 caracteres.");
            setCargando(false);
            return;
        }

        // Validación de email
        if (!emailRegex.test(formData.email)) {
            setErrorMessage("Introduce un correo electrónico válido.");
            setCargando(false);
            return;
        }

        // Validación de seguridad de contraseña
        if (!reqLength || !reqUpper || !reqNum) {
            setErrorMessage("La contraseña no cumple todos los requisitos.");
            setCargando(false);
            return;
        }

        // Validación de coincidencia
        if (formData.password !== formData.repetirPassword) {
            setErrorMessage("Las contraseñas no coinciden.");
            setCargando(false);
            return;
        }

        try {
            const response = await AuthService.register(formData);
            
            if (response.data && response.data.token) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("usuario", JSON.stringify(response.data.user));
                window.location.href = "/home";
            } else {
                window.location.href = "/login";
            }
        } catch (error) {
            setErrorMessage("Error al conectar con el servidor o el usuario ya existe.");
            setCargando(false);
        }
    };

    return (
        <div className="registro-page">
            <div className="registro-panel">
                <div className="registro-logo-container">
                    <img src="/img/logo-vault.png" alt="Logo Reading Vault" className="registro-logo" />
                </div>
                
                {cargando ? (
                    // Mostramos el componente Loader mientras cargando es true
                    <Loader texto="Creando tu cuenta..." />
                ) : (
                    // Formulario visible cuando no hay carga
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
                               <input 
                                    type="date" 
                                    name="fechaNacimiento" 
                                    value={formData.fechaNacimiento} 
                                    onChange={handleChange} 
                                    className="registro-input" 
                                    min="1900-01-01" 
                                    max={new Date().toISOString().split('T')[0]} 
                                    required 
                                />
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

                            {/* Campo de contraseña */}
                            <div className="registro-form-group">
                                <label className="registro-label">Contraseña</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} className="registro-input" required />
                                
                                {formData.password.length > 0 && (
                                    <div className="registro-hints">
                                        <span className={reqLength ? "hint-met" : "hint-unmet"}>
                                            {reqLength ? "✅" : "❌"} Mínimo 8 caracteres
                                        </span><br/>
                                        <span className={reqUpper ? "hint-met" : "hint-unmet"}>
                                            {reqUpper ? "✅" : "❌"} Una letra mayúscula
                                        </span><br/>
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

                        {/* Mostrar mensaje de error si existe */}
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
                )}
            </div>
        </div>
    );
};

export default Registro;