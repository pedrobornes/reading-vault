package com.readingvault.services;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.readingvault.models.Estanteria; // IMPORTANTE
import com.readingvault.models.Usuario;
import com.readingvault.repositories.UsuarioRepository;

import jakarta.transaction.Transactional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EstanteriaService estanteriaService;

    public Usuario guardarSinEncriptar(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    // busquedas
    public Optional<Usuario> buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public Optional<Usuario> buscarPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    public Optional<Usuario> buscarPorNombreUsuario(String nombreUsuario) {
        return usuarioRepository.findByNombreUsuario(nombreUsuario);
    }

    public Usuario actualizarPerfil(Long id, Usuario datosNuevos) throws Exception {
        Usuario userExistente = usuarioRepository.findById(id)
                .orElseThrow(() -> new Exception("Usuario no encontrado"));

        // Validar que el nuevo username no lo tenga OTRO usuario
        if (!userExistente.getNombreUsuario().equals(datosNuevos.getNombreUsuario())) {
            if (usuarioRepository.existsByNombreUsuario(datosNuevos.getNombreUsuario())) {
                throw new Exception("El nombre de usuario ya está en uso");
            }
        }

        // Validar que el nuevo email no lo tenga otro usuario
        if (!userExistente.getEmail().equals(datosNuevos.getEmail())) {
            if (usuarioRepository.existsByEmail(datosNuevos.getEmail())) {
                throw new Exception("El correo ya está registrado");
            }
        }

        // Gestión de contraseña: Solo se encripta si el usuario escribe una nueva
        if (datosNuevos.getPassword() != null && !datosNuevos.getPassword().trim().isEmpty()) {
            userExistente.setPassword(passwordEncoder.encode(datosNuevos.getPassword()));
        }

        // Actualizar el resto de campos
        userExistente.setNombre(datosNuevos.getNombre());
        userExistente.setApellidos(datosNuevos.getApellidos());
        userExistente.setFechaNacimiento(datosNuevos.getFechaNacimiento());
        userExistente.setLocalidad(datosNuevos.getLocalidad());
        userExistente.setBiografia(datosNuevos.getBiografia());
        userExistente.setNombreUsuario(datosNuevos.getNombreUsuario());
        userExistente.setEmail(datosNuevos.getEmail());

        if (datosNuevos.getGenero() != null) {
            userExistente.setGenero(datosNuevos.getGenero());
        }

        return usuarioRepository.save(userExistente);
    }

    public Usuario actualizarPrivacidad(Long id, Map<String, String> ajustes) throws Exception {
        Usuario user = usuarioRepository.findById(id).orElseThrow();

        user.setPrivacidadPerfil(ajustes.get("perfil"));
        user.setPrivacidadLibros(ajustes.get("libros"));
        user.setPrivacidadAmigos(ajustes.get("amigos"));
        user.setPrivacidadDatos(ajustes.get("datosPersonales"));

        return usuarioRepository.save(user);
    }

    @Transactional
    public void eliminar(Long id) {
        // si da error es porque no tenemos CascadeType.ALL
        usuarioRepository.deleteById(id);
    }

    @Transactional
    public Usuario registrarUsuario(Usuario usuario) {
        // Encriptar contraseña 
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));

        // Guardar el usuario ya encriptado
        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        //  Crear estanterías automáticas
        String[] basicas = { "Pendiente", "Leyendo", "Leído" };
        for (String nombre : basicas) {
            Estanteria e = new Estanteria();
            e.setNombre(nombre);
            e.setTipo("Predefinida");
            e.setUsuario(usuarioGuardado);
            estanteriaService.guardar(e);
        }

        return usuarioGuardado;
    }

}