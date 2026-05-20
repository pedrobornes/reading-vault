package com.readingvault.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
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

import com.readingvault.models.Estanteria;
import com.readingvault.models.LibroEstanteria;
import com.readingvault.repositories.EstanteriaRepository;
import com.readingvault.repositories.LibroEstanteriaRepository;
import com.readingvault.services.EstanteriaService;

@RestController
@RequestMapping("/api/bibliotecas")
@CrossOrigin(origins = "http://localhost:5173")
public class BibliotecaController {

    @Autowired
    private EstanteriaService estanteriaService;

    @Autowired
    private LibroEstanteriaRepository libroEstanteriaRepository;

    @Autowired
    private EstanteriaRepository estanteriaRepository;

    @GetMapping("/estado")
    public ResponseEntity<?> obtenerEstadoLibro(
            @RequestParam Long idUsuario,
            @RequestParam String titulo,
            @RequestParam String autor) {
        try {
            return estanteriaService.obtenerNombreEstanteriaDelLibro(idUsuario, titulo, autor)
                    .map(nombre -> ResponseEntity.ok(Map.of("nombreEstanteria", nombre)))
                    .orElse(ResponseEntity.ok(Map.of("nombreEstanteria", "")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // Guarda un libro en la biblioteca (y en la BD local si no existe)
    @PostMapping("/add")
    public ResponseEntity<?> añadirLibro(@RequestBody Map<String, Object> payload) {
        try {
            Long idUsuario = Long.valueOf(payload.get("idUsuario").toString());
            String nombreEstanteria = payload.get("nombreEstanteria").toString();

            // Extraemos todo el objeto libro (incluyendo ISBN, géneros, etc.)
            @SuppressWarnings("unchecked")
            Map<String, Object> libroData = (Map<String, Object>) payload.get("libro");

            // Pasamos el mapa completo al servicio
            estanteriaService.agregarLibroAEstanteria(libroData, idUsuario, nombreEstanteria);

            return ResponseEntity.ok(Map.of("mensaje", "¡Libro guardado en " + nombreEstanteria + "!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @Transactional
    @PutMapping("/actualizar-progreso")
    public ResponseEntity<?> actualizarProgresoLectura(@RequestBody Map<String, Object> payload) {
        try {
            // Extraemos los datos del JSON
            Long idRelacion = Long.parseLong(payload.get("idLibroEstanteria").toString());
            Integer nuevaPagina = Integer.parseInt(payload.get("paginaActual").toString());

            // Buscamos la relación en la BD
            LibroEstanteria relacion = libroEstanteriaRepository.findById(idRelacion)
                    .orElseThrow(() -> new RuntimeException("Relación no encontrada"));

            // Actualizamos solo el progreso
            relacion.setProgresoActual(nuevaPagina);

            // Guardamos los cambios
            libroEstanteriaRepository.save(relacion);

            return ResponseEntity.ok(Map.of(
                    "mensaje", "Progreso actualizado a la página " + nuevaPagina,
                    "progresoActual", nuevaPagina));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al guardar progreso: " + e.getMessage());
        }
    }

    @DeleteMapping("/remove")
    public ResponseEntity<?> eliminarLibro(@RequestParam Long idUsuario, @RequestParam String titulo,
            @RequestParam String autor) {
        try {
            // Buscamos todas las estanterías del usuario y borramos ese libro de donde esté
            estanteriaService.eliminarLibroDeUsuario(idUsuario, titulo, autor);
            return ResponseEntity.ok(Map.of("mensaje", "Libro eliminado de tu Vault"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/usuario/{idUsuario}/completa")
    public ResponseEntity<List<LibroEstanteria>> obtenerTodaLaBiblioteca(@PathVariable Long idUsuario) {
        // Esto devuelve la lista de LibroEstanteria, que incluye el objeto Libro y el
        // objeto Estanteria
        List<LibroEstanteria> biblioteca = libroEstanteriaRepository.findByEstanteria_Usuario_IdUsuario(idUsuario);
        return ResponseEntity.ok(biblioteca);
    }

    @PutMapping("/actualizar-estanteria")
    public ResponseEntity<?> actualizarEstanteria(@RequestBody Map<String, Object> payload) {
        try {
            Long idRelacion = Long.parseLong(payload.get("idLibroEstanteria").toString());
            String nuevoEstado = payload.get("nuevoNombreEstanteria").toString();

            // Buscamos la relación actual (LibroEstanteria)
            LibroEstanteria relacion = libroEstanteriaRepository.findById(idRelacion)
                    .orElseThrow(() -> new RuntimeException("Relación libro-estantería no encontrada"));

            // Obtenemos el ID del usuario de esa relación para buscar SU estantería "Leído"
            Long idUsuario = relacion.getEstanteria().getUsuario().getIdUsuario();

            // Buscamos la estantería de destino usando TU método del repositorio
            Estanteria estanteriaDestino = estanteriaRepository.findByUsuario_IdUsuarioAndNombre(idUsuario, nuevoEstado)
                    .orElseThrow(() -> new RuntimeException(
                            "La estantería " + nuevoEstado + " no existe para este usuario"));

            // Cambiamos la estantería y guardamos
            relacion.setEstanteria(estanteriaDestino);
            libroEstanteriaRepository.save(relacion);

            return ResponseEntity.ok(Map.of("mensaje", "¡Libro movido a " + nuevoEstado + " con éxito!"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

}
