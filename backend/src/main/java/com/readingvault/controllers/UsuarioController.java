package com.readingvault.controllers;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.readingvault.models.Usuario;
import com.readingvault.services.CloudinaryService;
import com.readingvault.services.UsuarioService;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private CloudinaryService cloudinaryService;



    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerPerfil(@PathVariable Long id) {
        Optional<Usuario> usuario = usuarioService.buscarPorId(id);

        return usuario.map(u -> {
            u.setPassword(null);
            return ResponseEntity.ok(u);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/actualizar")
    public ResponseEntity<?> actualizarDatos(@PathVariable Long id, @RequestBody Usuario usuarioDatos)
            throws Exception {
        Usuario actualizado = usuarioService.actualizarPerfil(id, usuarioDatos);
        if (actualizado != null) {
            actualizado.setPassword(null); // Seguridad
            return ResponseEntity.ok(actualizado);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuario no encontrado");
        }
    }

    @PostMapping("/{id}/actualizar-foto")
    public ResponseEntity<?> actualizarFoto(@PathVariable Long id, @RequestParam("foto") MultipartFile archivo) {
        try {
            Usuario usuario = usuarioService.buscarPorId(id)
                    .orElseThrow(() -> new Exception("Usuario no encontrado"));

            // 1. Subir a Cloudinary y obtener URL
            String urlNube = cloudinaryService.subirFoto(archivo);

            // 2. Guardar esa URL directamente en la base de datos
            usuario.setFotoPerfil(urlNube);
            usuarioService.guardarSinEncriptar(usuario);

            return ResponseEntity.ok(Map.of("fotoPerfil", urlNube));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/eliminar-foto")
    public ResponseEntity<?> eliminarFoto(@PathVariable Long id) {
        try {
            Usuario usuario = usuarioService.buscarPorId(id)
                    .orElseThrow(() -> new Exception("Usuario no encontrado"));

            // 1. Ponemos la URL por defecto (la misma que usas en el frontend como
            // fallback)
            String fotoDefecto = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
            usuario.setFotoPerfil(fotoDefecto);

            // 2. Guardamos el cambio
            usuarioService.guardarSinEncriptar(usuario);

            return ResponseEntity.ok(Map.of("fotoPerfil", fotoDefecto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar foto: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}/eliminar")
    public ResponseEntity<?> eliminarCuenta(@PathVariable Long id) {
        try {
            Usuario usuario = usuarioService.buscarPorId(id)
                    .orElseThrow(() -> new Exception("Usuario no encontrado"));

            // Borrar la foto de Cloudinary si no es la por defecto
            String urlFoto = usuario.getFotoPerfil();
            if (urlFoto != null && urlFoto.contains("cloudinary")) {
                String publicId = cloudinaryService.extraerPublicId(urlFoto);
                cloudinaryService.eliminarFoto(publicId);
            }

            // Borrar de la base de datos
            usuarioService.eliminar(id);

            return ResponseEntity.ok(Map.of("mensaje", "Usuario y datos eliminados con éxito"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}