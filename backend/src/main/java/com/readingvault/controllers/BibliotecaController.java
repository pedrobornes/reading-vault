package com.readingvault.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.readingvault.dto.LibroExternoDTO;
import com.readingvault.models.LibroEstanteria;
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

    @PostMapping("/add")
    public ResponseEntity<?> añadirLibro(@RequestBody Map<String, Object> payload) {
        try {
            Long idUsuario = Long.valueOf(payload.get("idUsuario").toString());
            String nombreEstanteria = payload.get("nombreEstanteria").toString();

            // Mapeamos los datos que vienen del frontend al DTO que espera tu service
            Map<String, Object> libroData = (Map<String, Object>) payload.get("libro");

            LibroExternoDTO dto = new LibroExternoDTO();
            dto.setTitle(libroData.get("titulo").toString());
            dto.setNombrePrimerAutor(libroData.get("autor").toString());
            dto.setCoverId(libroData.get("portada") != null ? libroData.get("portada").toString() : null);

            estanteriaService.agregarLibroAEstanteria(dto, idUsuario, nombreEstanteria);

            return ResponseEntity.ok(Map.of("mensaje", "¡Libro guardado en " + nombreEstanteria + "!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
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

}
