package com.readingvault.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.readingvault.models.Usuario;
import com.readingvault.security.JwtUtil;
import com.readingvault.services.UsuarioService;

/* * Controlador encargado de la autenticación y entrega de Tokens */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private UsuarioService usuarioService;

    // Nota: Necesitaremos configurar el AuthenticationManager en SecurityConfig después
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        // Aquí se validaría la contraseña (por ahora simplificado)
        final UserDetails userDetails = userDetailsService.loadUserByUsername(email);

        // Generamos el token para el usuario
        final String token = jwtUtil.generateToken(userDetails.getUsername());

        // Devolvemos el token en un JSON
        Map<String, String> response = new HashMap<>();
        response.put("token", token);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        // Comprobamos si el email ya existe para no duplicar
        if (usuarioService.buscarPorEmail(usuario.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: El email ya está registrado.");
        }

        Usuario nuevoUsuario = usuarioService.registrarUsuario(usuario);
        return ResponseEntity.ok("Usuario registrado con éxito: " + nuevoUsuario.getEmail());
    }
}
