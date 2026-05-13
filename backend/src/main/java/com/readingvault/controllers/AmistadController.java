package com.readingvault.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.readingvault.models.Amistad;
import com.readingvault.models.Usuario;
import com.readingvault.services.AmistadService;

@RestController
@RequestMapping("/api/amistades")
@CrossOrigin(origins = "*")
public class AmistadController {

    @Autowired
    private AmistadService amistadService;

    // Verificar si son amigos (para bloqueos de privacidad)
    @GetMapping("/verificar/{id1}/{id2}")
    public ResponseEntity<Boolean> verificar(@PathVariable Long id1, @PathVariable Long id2) {
        return ResponseEntity.ok(amistadService.sonAmigos(id1, id2));
    }

    // Estado de la relación (para el botón del Sidebar)
    @GetMapping("/estado/{id1}/{id2}")
    public ResponseEntity<String> obtenerEstado(@PathVariable Long id1, @PathVariable Long id2) {
        return ResponseEntity.ok(amistadService.obtenerEstado(id1, id2));
    }

    // Enviar solicitud de amistad
    @PostMapping("/enviar")
    public ResponseEntity<?> enviar(@RequestBody Map<String, Long> ids) {
        amistadService.enviarSolicitud(ids.get("idRemitente"), ids.get("idDestinatario"));
        return ResponseEntity.ok().build();
    }

    // Listar solicitudes pendientes que me han enviado a MÍ
    @GetMapping("/pendientes/{idUsuario}")
    public ResponseEntity<List<Amistad>> obtenerPendientes(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(amistadService.obtenerPendientes(idUsuario));
    }

    // Listar mis amigos confirmados (devuelve lista de Usuarios)
    @GetMapping("/lista/{idUsuario}")
    public ResponseEntity<List<Usuario>> listarMisAmigos(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(amistadService.obtenerListaAmigos(idUsuario));
    }

    // Aceptar solicitud (cambia PENDIENTE a ACEPTADA)
    @PutMapping("/aceptar/{idAmistad}")
    public ResponseEntity<?> aceptar(@PathVariable Long idAmistad) {
        try {
            amistadService.aceptarSolicitud(idAmistad);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Rechazar solicitud o eliminar amigo
    @DeleteMapping("/rechazar/{idAmistad}")
    public ResponseEntity<?> rechazar(@PathVariable Long idAmistad) {
        try {
            amistadService.rechazarOEliminarAmistad(idAmistad);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/eliminar/{idUsuario1}/{idUsuario2}")
    public ResponseEntity<?> eliminarAmistad(
        @PathVariable Long idUsuario1, 
        @PathVariable Long idUsuario2
    ) {
        // Tu lógica de borrado aquí
        amistadService.eliminarAmistad(idUsuario1, idUsuario2);
        return ResponseEntity.ok().build();
    }
}