import axios from "axios";

// URL API de Spring Boot
const API_URL = "http://localhost:8080/api/auth/";

axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            // Inyectamos el token en caliente justo antes de disparar la petición
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Envía los datos de registro al backend.
 */
const register = (userData) => {
    // return axios.post(API_URL + "registro", {
    //     nombre: userData.nombre,
    //     apellidos: userData.apellidos,
    //     fechaNacimiento: userData.fechaNacimiento,
    //     nombreUsuario: userData.nombreUsuario,
    //     email: userData.email,
    //     password: userData.password
    // });
    return axios.post(API_URL + "registro", userData);
};

/**
 * Envía las credenciales de login y devuelve el token JWT
 */
const login = (email, password) => {
    return axios.post(API_URL + "login", {
        email,
        password
    });
};

export default {
    register,
    login
};