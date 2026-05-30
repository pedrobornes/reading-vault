import axios from "axios";
import { API_BASE_URL } from "../apiConfig";

// Construye ruta de auth limpia
const API_URL = `${API_BASE_URL.replace(/\/$/, "")}/api/auth`;

const register = (userData) => {
    // Petición registro
    return axios.post(`${API_URL}/registro`, userData);
};

const login = (email, password) => {
    // Petición login
    return axios.post(`${API_URL}/login`, {
        email,
        password
    });
};

export default {
    register,
    login
};