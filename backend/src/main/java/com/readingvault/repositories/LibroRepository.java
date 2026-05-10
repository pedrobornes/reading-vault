package com.readingvault.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.readingvault.models.Libro;

@Repository
public interface LibroRepository extends JpaRepository<Libro, Long> {

    // Búsqueda por título
    List<Libro> findByTituloContainingIgnoreCase(String titulo);

    // Búsqueda por Título y Autor
    Optional<Libro> findByTituloAndAutor(String titulo, String autor);

    // Busca un libro por su identificador único ISBN.
    Optional<Libro> findByIsbn(String isbn);

    // Verifica si un libro existe por su ISBN
    boolean existsByIsbn(String isbn);

    // Búsqueda híbrida: busca en el título, autor o en los géneros (ignora mayúsculas)
    List<Libro> findByTituloContainingIgnoreCaseOrAutorContainingIgnoreCaseOrGenerosContainingIgnoreCase(
    String titulo, String autor, String generos
);
}
