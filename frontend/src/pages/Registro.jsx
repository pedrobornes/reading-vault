import React, { useState } from 'react';
import AuthService from '../services/Auth.service';

const Registro = () => {
    // 1. Aquí guardamos lo que el usuario escribe
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        fechaNacimiento: '',
        nombreUsuario: '',
        email: '',
        password: '',
        repetirPassword: ''
    });

    // 2. Esta función se activa cada vez que escribes en un input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // 3. Esta función se activa al pulsar el botón "Registrarse"
    const handleRegister = async (e) => {
        e.preventDefault(); // Evita que la página se recargue

        if (formData.password !== formData.repetirPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        try {
            // Enviamos los datos a tu Backend de Java
            await AuthService.register(formData);
            alert("¡Usuario guardado en MySQL con éxito!");
        } catch (error) {
            alert("Error al conectar con el servidor");
        }
    };

    return (
        <div style={{ backgroundColor: '#D1F7E8', padding: '50px', minHeight: '100vh' }}>
            {/* Contenedor del formulario (el cuadro verde oscuro de tu imagen) */}
            <div style={{ backgroundColor: '#89A894', padding: '30px', borderRadius: '15px', maxWidth: '600px', margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center', color: 'white' }}>Registro</h2>
                
                <form onSubmit={handleRegister}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        {/* INPUT NOMBRE */}
                        <div>
                            <label>Nombre</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} style={inputStyle} />
                        </div>
                        {/* INPUT APELLIDOS */}
                        <div>
                            <label>Apellidos</label>
                            <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} style={inputStyle} />
                        </div>
                        {/* FECHA NACIMIENTO */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <label>Fecha de nacimiento</label>
                            <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} style={inputStyle} />
                        </div>
                        {/* NOMBRE USUARIO */}
                        <div>
                            <label>Nombre de usuario</label>
                            <input type="text" name="nombreUsuario" value={formData.nombreUsuario} onChange={handleChange} style={inputStyle} />
                        </div>
                        {/* EMAIL */}
                        <div>
                            <label>Correo electrónico</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} />
                        </div>
                        {/* PASSWORD */}
                        <div>
                            <label>Contraseña</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} style={inputStyle} />
                        </div>
                        {/* REPETIR PASSWORD */}
                        <div>
                            <label>Repetir contraseña</label>
                            <input type="password" name="repetirPassword" value={formData.repetirPassword} onChange={handleChange} style={inputStyle} />
                        </div>
                    </div>

                    <button type="submit" style={buttonStyle}>Registrarse</button>
                </form>
            </div>
        </div>
    );
};

// Estilos rápidos para que se parezca a tu diseño
const inputStyle = { width: '100%', padding: '8px', borderRadius: '5px', border: 'none', marginTop: '5px' };
const buttonStyle = { width: '100%', padding: '12px', backgroundColor: '#C88B7D', color: 'white', border: 'none', borderRadius: '10px', marginTop: '20px', cursor: 'pointer' };

export default Registro;