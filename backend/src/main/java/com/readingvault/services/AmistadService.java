package com.readingvault.services;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.readingvault.models.Amistad;
import com.readingvault.models.Usuario;
import com.readingvault.repositories.AmistadRepository;
import com.readingvault.repositories.UsuarioRepository;

import jakarta.transaction.Transactional;

@Service
public class AmistadService {

    @Autowired
    private AmistadRepository amistadRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public boolean sonAmigos(Long id1, Long id2) {
        if (id1.equals(id2)) return true;
        return amistadRepository.findAmistadAceptada(id1, id2).isPresent();
    }

    public String obtenerEstado(Long id1, Long id2) {
        if (id1.equals(id2)) return "PROPIO";
        
        Optional<Amistad> amistad = amistadRepository.encontrarCualquierRelacion(id1, id2);
        
        if (amistad.isPresent()) {
            return amistad.get().getEstado(); // Retorna "ACEPTADA" o "PENDIENTE"
        }
        
        return "NINGUNA";
    }

    @Transactional
    public void aceptarSolicitud(Long idAmistad) {
        Amistad a = amistadRepository.findById(idAmistad)
            .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        a.setEstado("ACEPTADA");
        amistadRepository.save(a);
    }

    @Transactional
    public void rechazarOEliminarAmistad(Long idAmistad) {
        amistadRepository.deleteById(idAmistad);
    }

    public List<Amistad> obtenerPendientes(Long idUsuario) {
        return amistadRepository.findSolicitudesPendientes(idUsuario);
    }

    public void enviarSolicitud(Long idRemitente, Long idDestinatario) {
        // 1. Verificamos si ya existe cualquier relación para evitar duplicados
        if (amistadRepository.encontrarCualquierRelacion(idRemitente, idDestinatario).isPresent()) {
            return;
        }

        // 2. Buscamos las entidades de usuario
        Usuario remitente = usuarioRepository.findById(idRemitente)
            .orElseThrow(() -> new RuntimeException("Remitente no encontrado"));
        Usuario destinatario = usuarioRepository.findById(idDestinatario)
            .orElseThrow(() -> new RuntimeException("Destinatario no encontrado"));

        // 3. Creamos la nueva amistad
        Amistad nueva = new Amistad();
        nueva.setUsuario1(remitente);
        nueva.setUsuario2(destinatario);
        nueva.setEstado("PENDIENTE");
        nueva.setFecha(LocalDate.now());

        amistadRepository.save(nueva);
    }

    public List<Amistad> listarAmistades() {
        return amistadRepository.findAll();
    }
}