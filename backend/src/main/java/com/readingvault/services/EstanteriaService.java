package com.readingvault.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.readingvault.dto.LibroExternoDTO;
import com.readingvault.models.Estanteria;
import com.readingvault.models.Libro;
import com.readingvault.models.LibroEstanteria;
import com.readingvault.repositories.EstanteriaRepository;
import com.readingvault.repositories.LibroEstanteriaRepository;
import com.readingvault.repositories.LibroRepository;

import jakarta.transaction.Transactional;

@Service
public class EstanteriaService {

    @Autowired
    private EstanteriaRepository estanteriaRepository;

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private LibroEstanteriaRepository libroEstanteriaRepository;

    /**
     * Guarda una nueva estantería en la base de datos.
     */
    public Estanteria crearEstanteria(Estanteria estanteria) {
        return estanteriaRepository.save(estanteria);
    }

    /**
     * Agrega un libro desde la búsqueda de Google a una estantería del usuario.
     * Si el libro no existe en la BD local, lo crea primero.
     */
    @Transactional
    public void agregarLibroAEstanteria(LibroExternoDTO libroExterno, Long usuarioId, String nombreEstanteria) {

        // Buscamos el libro en nuestra BD local para no repetir datos
        Libro libroLocal = libroRepository
                .findByTituloAndAutor(libroExterno.getTitle(), libroExterno.getNombrePrimerAutor())
                .orElseGet(() -> {
                    // Si no existe, mapeamos los datos del DTO de Google al modelo Libro
                    Libro nuevoLibro = new Libro();
                    nuevoLibro.setTitulo(libroExterno.getTitle());
                    nuevoLibro.setAutor(libroExterno.getNombrePrimerAutor());
                    nuevoLibro.setDescripcion("Páginas: " + libroExterno.getNumberOfPages());
                    // Usamos coverId porque ahí guardamos la URL de Google
                    nuevoLibro.setFotoPortada(libroExterno.getCoverId());
                    return libroRepository.save(nuevoLibro);
                });

        // Buscamos la estantería específica del usuario
        Estanteria estanteria = estanteriaRepository.findByUsuario_IdUsuarioAndNombre(usuarioId, nombreEstanteria)
                .orElseThrow(() -> new RuntimeException(
                        "La estantería '" + nombreEstanteria + "' no existe para este usuario"));

        // Verificamos si el libro ya está en esa estantería para evitar duplicados
        boolean yaExiste = libroEstanteriaRepository.existsByEstanteriaAndLibro(estanteria, libroLocal);

        if (!yaExiste) {
            // Creamos la relación en la tabla intermedia
            LibroEstanteria relacion = new LibroEstanteria();
            relacion.setEstanteria(estanteria);
            relacion.setLibro(libroLocal);
            // La fecha se gestiona automáticamente en el modelo
            libroEstanteriaRepository.save(relacion);
        }
    }

    public Optional<Estanteria> buscarPorUsuarioYNombre(Long idUsuario, String nombre) {
        // Buscamos la estantería específica de ese usuario
        return estanteriaRepository.findByUsuario_IdUsuarioAndNombre(idUsuario, nombre);
    }

    public Estanteria guardar(Estanteria estanteria) {
        return estanteriaRepository.save(estanteria);
    }

    @Transactional
    public void eliminarLibroDeUsuario(Long idUsuario, String titulo, String autor) {
        // 1. Buscamos el libro
        Optional<Libro> libro = libroRepository.findByTituloAndAutor(titulo, autor);

        if (libro.isPresent()) {
            // 2. Borramos cualquier relación de ese libro con las estanterías de ese
            // usuario
            libroEstanteriaRepository.deleteByLibroAndEstanteria_Usuario_IdUsuario(libro.get(), idUsuario);
        }
    }
}
