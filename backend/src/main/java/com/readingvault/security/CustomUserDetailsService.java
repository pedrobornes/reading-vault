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

/* * Este servicio permite a Spring Security encontrar al usuario en la BD */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Buscamos al usuario por su email (que es lo que pide vuestro diseño de login)
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con email: " + email));

        // Devolvemos un objeto User de Spring Security con los datos de vuestro modelo
        return new User(usuario.getEmail(), usuario.getPassword(), new ArrayList<>());
    }
}