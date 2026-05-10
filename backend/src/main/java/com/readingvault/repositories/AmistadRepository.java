package com.readingvault.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.readingvault.models.Amistad;

@Repository
public interface AmistadRepository extends JpaRepository<Amistad, Long> {

    // Busca si existe una relación ACEPTADA entre dos usuarios
    @Query("SELECT a FROM Amistad a WHERE " +
           "((a.usuario1.idUsuario = :id1 AND a.usuario2.idUsuario = :id2) OR " +
           "(a.usuario1.idUsuario = :id2 AND a.usuario2.idUsuario = :id1)) " +
           "AND a.estado = 'ACEPTADA'")
    Optional<Amistad> findAmistadAceptada(@Param("id1") Long id1, @Param("id2") Long id2);

    // Opcional: Busca si hay una solicitud pendiente entre ambos
    @Query("SELECT a FROM Amistad a WHERE " +
           "((a.usuario1.idUsuario = :id1 AND a.usuario2.idUsuario = :id2) OR " +
           "(a.usuario1.idUsuario = :id2 AND a.usuario2.idUsuario = :id1))")
    Optional<Amistad> encontrarCualquierRelacion(@Param("id1") Long id1, @Param("id2") Long id2);

    // Busca solicitudes que esperan MI respuesta
    @Query("SELECT a FROM Amistad a WHERE a.usuario2.idUsuario = :idUsuario AND a.estado = 'PENDIENTE'")
    List<Amistad> findSolicitudesPendientes(@Param("idUsuario") Long idUsuario);

    // Busca mis amigos confirmados
    @Query("SELECT a FROM Amistad a WHERE (a.usuario1.idUsuario = :idUsuario OR a.usuario2.idUsuario = :idUsuario) AND a.estado = 'ACEPTADA'")
    List<Amistad> findMisAmigos(@Param("idUsuario") Long idUsuario);
}