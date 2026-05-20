package com.readingvault.repositories;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.readingvault.models.Estanteria;
import com.readingvault.models.Libro;
import com.readingvault.models.LibroEstanteria;

@Repository
public interface LibroEstanteriaRepository extends JpaRepository<LibroEstanteria, Long> {
    
    // Para ver todos los libros que hay dentro de una estantería concreta
    List<LibroEstanteria> findByEstanteriaIdEstanteria(Long idEstanteria);

    // Para saber si un libro ya está en una estantería específica
    boolean existsByEstanteriaAndLibro(Estanteria estanteria, Libro libro);

    // Para el reto de lectura por año 
    long countByEstanteriaAndFechaAgregadoBetween(Estanteria estanteria, LocalDate inicio, LocalDate fin);

    // (Opcional) Para comprobar si el libro está en CUALQUIER estantería del usuario
    boolean existsByLibroAndEstanteria_Usuario_IdUsuario(Libro libro, Long idUsuario);

    // PARA BORRAR: Este método busca la relación por el libro y el dueño de la estantería
    @org.springframework.data.jpa.repository.Modifying
    @jakarta.transaction.Transactional
    void deleteByLibroAndEstanteria_Usuario_IdUsuario(Libro libro, Long idUsuario);

    /**
     * Encuentra la relación de un libro específico para un usuario concreto.
     */
    Optional<LibroEstanteria> findByLibroAndEstanteria_Usuario_IdUsuario(Libro libro, Long idUsuario);

    List<LibroEstanteria> findByEstanteria_Usuario_IdUsuario(Long idUsuario);

   List<LibroEstanteria> findByEstanteriaUsuarioIdUsuario(Long idUsuario);

}



