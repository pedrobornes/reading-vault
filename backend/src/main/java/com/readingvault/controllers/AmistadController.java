package com.readingvault.controllers;

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

import com.readingvault.services.AmistadService;

@RestController
@RequestMapping("/api/amistades")
@CrossOrigin(origins = "*")
public class AmistadController {

    @Autowired
    private AmistadService amistadService;

    // Para el candado de privacidad (Booleano)
    @GetMapping("/verificar/{id1}/{id2}")
    public ResponseEntity<Boolean> verificar(@PathVariable Long id1, @PathVariable Long id2) {
        return ResponseEntity.ok(amistadService.sonAmigos(id1, id2));
    }

    // Para el botón del Sidebar (String: PENDIENTE, ACEPTADA, NINGUNA)
    @GetMapping("/estado/{id1}/{id2}")
    public ResponseEntity<String> obtenerEstado(@PathVariable Long id1, @PathVariable Long id2) {
        return ResponseEntity.ok(amistadService.obtenerEstado(id1, id2));
    }

    // Para crear la solicitud
    @PostMapping("/enviar")
    public ResponseEntity<?> enviar(@RequestBody Map<String, Long> ids) {
        amistadService.enviarSolicitud(ids.get("idRemitente"), ids.get("idDestinatario"));
        return ResponseEntity.ok().build();
    }
}