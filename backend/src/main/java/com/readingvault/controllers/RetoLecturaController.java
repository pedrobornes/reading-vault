package com.readingvault.controllers;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.readingvault.models.RetoLectura;
import com.readingvault.services.RetoLecturaService;

@RestController
@RequestMapping("/api/retos")
@CrossOrigin(origins = "*")
public class RetoLecturaController {

    @Autowired
    private RetoLecturaService retoService;

    // Obtiene el reto del usuario para el año actual
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> obtenerRetoActual(@PathVariable Long usuarioId) {
        int yearActual = LocalDate.now().getYear();
        
        try {
            // Actualizamos el progreso para asegurar que los datos son reales
            retoService.actualizarProgreso(usuarioId, yearActual);
            
            // Buscamos el reto
            RetoLectura reto = retoService.obtenerRetoPorUsuarioYAnio(usuarioId, yearActual);
            return ResponseEntity.ok(reto);
            
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // Establece o actualizar el num de libros q el usuario quiere leer
    @PostMapping("/objetivo")
    public ResponseEntity<RetoLectura> setObjetivo(@RequestParam Long usuarioId, 
                                                   @RequestParam int objetivo) {
        int yearActual = LocalDate.now().getYear();
        RetoLectura retoActualizado = retoService.establecerObjetivo(usuarioId, yearActual, objetivo);
        return ResponseEntity.ok(retoActualizado);
    }
}