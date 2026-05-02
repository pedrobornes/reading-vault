package com.readingvault.repositories;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.readingvault.models.Review;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    // Spring busca el campo "libro" dentro de Review y luego el "idLibro" dentro de Libro
    List<Review> findByLibroIdLibro(Long idLibro);

    Optional<Review> findByUsuario_IdUsuarioAndLibro_IdLibro(Long idUsuario, Long idLibro);

    List<Review> findByUsuario_IdUsuario(Long idUsuario);
}