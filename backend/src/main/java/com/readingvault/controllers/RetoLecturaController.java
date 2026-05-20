package com.readingvault.controllers;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.readingvault.models.LibroEstanteria;
import com.readingvault.models.RetoLectura;
import com.readingvault.models.Usuario;
import com.readingvault.repositories.LibroEstanteriaRepository;
import com.readingvault.repositories.RetoLecturaRepository;
import com.readingvault.repositories.UsuarioRepository;

@RestController
@RequestMapping("/api/retos")
@CrossOrigin(origins = "http://127.0.0.1:5173")
public class RetoLecturaController {

    @Autowired
    private RetoLecturaRepository retoLecturaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private LibroEstanteriaRepository libroEstanteriaRepository;

    // Obtener el reto del año actual
   @GetMapping("/usuario/{idUsuario}/actual")
    public ResponseEntity<?> obtenerRetoActual(@PathVariable Long idUsuario) {
        int anioActual = LocalDate.now().getYear();
        
        RetoLectura reto = retoLecturaRepository.findByUsuario_IdUsuarioAndYear(idUsuario, anioActual)
                .orElse(null);
        
        if (reto == null) {
            RetoLectura retoVacio = new RetoLectura();
            retoVacio.setObjetivoLibros(0);
            retoVacio.setYear(anioActual);
            retoVacio.setCompletados(0);
            return ResponseEntity.ok(retoVacio);
        }

        // Nos traemos la lista completa de libros en estanterías de este usuario
        List<LibroEstanteria> todosLosLibros = libroEstanteriaRepository.findByEstanteriaUsuarioIdUsuario(idUsuario);

        // Filtramos y contamos cuántos están en la estantería "Leído" usando Streams de Java
        long librosLeidosReales = todosLosLibros.stream()
                .filter(le -> le.getEstanteria() != null && "Leído".equalsIgnoreCase(le.getEstanteria().getNombre()))
                .count();

        // Sincronizamos el histórico si el contador ha cambiado
        if (reto.getCompletados() != (int) librosLeidosReales) {
            reto.setCompletados((int) librosLeidosReales);
            retoLecturaRepository.save(reto);
        }
        
        return ResponseEntity.ok(reto);
    }

    // Crear/actualizar el reto del año actual
    @PostMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> guardarOActualizarReto(@PathVariable Long idUsuario, @RequestBody Map<String, Object> payload) {
        int anioActual = LocalDate.now().getYear();
        int objetivo = Integer.parseInt(payload.get("objetivoLibros").toString());

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Buscamos si ya existía una fila para este año, si no, creamos una nueva
        RetoLectura reto = retoLecturaRepository.findByUsuario_IdUsuarioAndYear(idUsuario, anioActual)
                .orElse(new RetoLectura());

        reto.setUsuario(usuario);
        reto.setYear(anioActual);
        reto.setObjetivoLibros(objetivo);
        // El contador de completados se inicializa en 0 si es nuevo, o conserva el que tenía
        if (reto.getIdReto() == null) {
            reto.setCompletados(0);
        }

        RetoLectura guardado = retoLecturaRepository.save(reto);
        return ResponseEntity.ok(guardado);
    }
}