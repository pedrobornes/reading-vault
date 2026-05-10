package com.readingvault.services;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.readingvault.models.Estanteria;
import com.readingvault.models.Genero;
import com.readingvault.models.Usuario;
import com.readingvault.repositories.UsuarioRepository;

import jakarta.transaction.Transactional;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EstanteriaService estanteriaService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Usuario guardarSinEncriptar(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    // Búsquedas
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
        // Validaciones de unicidad
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
        // Encriptar pass si se cambia
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

        // Actualizar géneros favoritos (ahora es una colección)
        if (datosNuevos.getGenerosFavoritos() != null) {
            userExistente.setGenerosFavoritos(datosNuevos.getGenerosFavoritos());
        }

        return usuarioRepository.save(userExistente);
    }

    @Transactional
    public Usuario actualizarGenerosFavoritos(Long id, Set<Genero> nuevosGeneros) throws Exception {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new Exception("Usuario no encontrado"));

        // Al setear el nuevo conjunto, JPA borra lo anterior en la tabla intermedia e
        // inserta lo nuevo
        u.setGenerosFavoritos(nuevosGeneros);

        return usuarioRepository.save(u);
    }

    @Transactional
    public Usuario actualizarPrivacidad(Long id, Map<String, String> ajustes) throws Exception {
        Usuario user = usuarioRepository.findById(id)
                .orElseThrow(() -> new Exception("Usuario no encontrado"));

        if (ajustes.containsKey("perfil")) {
            user.setPrivacidadPerfil(ajustes.get("perfil"));
        }
        if (ajustes.containsKey("libros")) {
            user.setPrivacidadLibros(ajustes.get("libros"));
        }
        if (ajustes.containsKey("amigos")) {
            user.setPrivacidadAmigos(ajustes.get("amigos"));
        }
        if (ajustes.containsKey("datosPersonales")) {
            user.setPrivacidadDatos(ajustes.get("datosPersonales"));
        }

        return usuarioRepository.saveAndFlush(user);
    }

    public void actualizarRacha(Usuario usuario) {
        LocalDate hoy = LocalDate.now();
        LocalDate ayer = hoy.minusDays(1);

        if (usuario.getFechaUltimaActividad() == null) {
            usuario.setRachaActual(1);
        } else if (usuario.getFechaUltimaActividad().equals(ayer)) {
            // Si la última vez fue ayer, sumamos 1 a la racha
            usuario.setRachaActual(usuario.getRachaActual() + 1);
        } else if (usuario.getFechaUltimaActividad().isBefore(ayer)) {
            // Si ha pasado más de un día, la racha se reinicia a 1
            usuario.setRachaActual(1);
        }
        // Si es el mismo día, no hacemos nada (mantenemos la racha)

        usuario.setFechaUltimaActividad(hoy);
        usuarioRepository.save(usuario);
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

        // Crear estanterías automáticas
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