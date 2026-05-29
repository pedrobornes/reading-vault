import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Importante para la navegación SPA
import AuthService from '../services/Auth.service';
import { API_BASE_URL } from '../apiConfig';
import '../assets/css/login.css';

const Login = () => {
    const [credentials, setCredentials] = useState({ usernameOrEmail: '', password: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await AuthService.login(credentials.usernameOrEmail, credentials.password);
            
            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("usuario", JSON.stringify(response.data.user));
                window.location.href = "/home";
            }
        } catch (error) {
            alert("Error: Credenciales incorrectas");
        }
    };

    return (
        <div className="login-page">
            <div className="login-panel">
                <div className="login-logo-container">
                    <img src="/img/logo-vault.png" alt="Logo Reading Vault" className="login-logo" />
                </div>
                
                <form onSubmit={handleLogin} className="login-form">
                    <div className="login-form-group">
                        <label className="login-label">Usuario / Correo electrónico</label>
                        <input 
                            type="text" 
                            name="usernameOrEmail" 
                            placeholder="Usuario / Correo electrónico" 
                            onChange={handleChange} 
                            className="login-input"
                            required 
                        />
                    </div>
                    
                    <div className="login-form-group">
                        <label className="login-label">Contraseña</label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="Contraseña" 
                            onChange={handleChange} 
                            className="login-input"
                            required 
                        />
                    </div>

                    <div className="forgot-password-link">
                        <a href="#" onClick={(e) => { e.preventDefault(); alert("Próximamente..."); }}>
                            Olvidé mi contraseña
                        </a>
                    </div>
                    
                    <button type="submit" className="login-button">Iniciar sesión</button>

                    <div className="register-redirect">
                        <span>¿Aún no tienes cuenta?</span>
                        <Link to="/registro" className="register-link">Regístrate aquí</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;