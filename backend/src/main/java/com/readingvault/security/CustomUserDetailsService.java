package com.readingvault.security;

import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.readingvault.models.Usuario;
import com.readingvault.repositories.UsuarioRepository;

/* Este servicio permite a Spring Security encontrar al usuario en la BD */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        // Intentamos buscar por Email
        // Si no existe, intentamos buscar por Username
        // Si ninguno existe, lanzamos la excepción
        Usuario usuario = usuarioRepository.findByEmail(identifier)
                .orElseGet(() -> usuarioRepository.findByNombreUsuario(identifier) // <--- Cambiado aquí
                .orElseThrow(() -> new UsernameNotFoundException("No se encontró usuario con: " + identifier)));

        // Devolvemos el usuario para que Spring compare la contraseña
        return new User(usuario.getEmail(), usuario.getPassword(), new ArrayList<>());
    }
}
