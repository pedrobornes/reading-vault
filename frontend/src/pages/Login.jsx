import React, { useState } from 'react';
import AuthService from '../services/Auth.service';

const Login = () => {
    // 1. Cambiamos 'email' por 'usernameOrEmail' para que sea más descriptivo
    const [credentials, setCredentials] = useState({ usernameOrEmail: '', password: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // 2. Enviamos el valor (sea email o usuario) al backend
            const response = await AuthService.login(credentials.usernameOrEmail, credentials.password);
            
            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
                alert("¡Login exitoso! Bienvenido.");
            }
        } catch (error) {
            alert("Error: Credenciales incorrectas");
        }
    };

    return (
        <div style={containerStyle}>
            <div style={boxStyle}>
                <h2 style={{color: 'white', marginBottom: '20px'}}>Log In</h2>
                <form onSubmit={handleLogin}>
                    {/* 3. Cambiamos type="email" a type="text" para que acepte el username */}
                    <input 
                        type="text" 
                        name="usernameOrEmail" 
                        placeholder="Email o Nombre de usuario" 
                        onChange={handleChange} 
                        style={inputStyle} 
                        required 
                    />
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Contraseña" 
                        onChange={handleChange} 
                        style={inputStyle} 
                        required 
                    />
                    
                    <button type="submit" style={buttonStyle}>Entrar</button>

                    {/* 4. Botón de "Olvidé mi contraseña" */}
                    <div style={forgotPasswordContainer}>
                        <a href="#" style={forgotPasswordLink} onClick={() => alert("Función de recuperación próximamente...")}>
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Estilos
const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#D1F7E8' };
const boxStyle = { backgroundColor: '#89A894', padding: '40px', borderRadius: '15px', textAlign: 'center', width: '300px' };
const inputStyle = { display: 'block', width: '100%', margin: '15px 0', padding: '12px', borderRadius: '5px', border: 'none', boxSizing: 'border-box' };
const buttonStyle = { width: '100%', padding: '12px', backgroundColor: '#C88B7D', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' };
const forgotPasswordContainer = { marginTop: '15px' };
const forgotPasswordLink = { color: '#f0f0f0', fontSize: '0.85rem', textDecoration: 'none' };

export default Login;