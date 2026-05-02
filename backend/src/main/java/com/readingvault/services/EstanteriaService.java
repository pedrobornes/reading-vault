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

    @Transactional
    public void agregarLibroAEstanteria(LibroExternoDTO libroExterno, Long usuarioId, String nombreEstanteria) {
        
        // Recupera el libro o lo crea con los datos completos
        Libro libroLocal = libroRepository
                .findByTituloAndAutor(libroExterno.getTitle(), libroExterno.getNombrePrimerAutor())
                .orElseGet(() -> {
                    Libro nuevoLibro = new Libro();
                    nuevoLibro.setTitulo(libroExterno.getTitle());
                    nuevoLibro.setAutor(libroExterno.getNombrePrimerAutor());
                    
                    // Sincronización de descripción
                    nuevoLibro.setDescripcion(libroExterno.getDescription() != null ? 
                            libroExterno.getDescription() : "Sin descripción disponible.");
                    nuevoLibro.setFotoPortada(libroExterno.getCoverId());
                    nuevoLibro.setFechaPublicacion(libroExterno.getPublishedDate());
                    nuevoLibro.setIsbn(libroExterno.getIsbn());
                    nuevoLibro.setPaginas(libroExterno.getPageCount());
                    
                    // Convertimos la lista de categorías a un String para la BD
                    if (libroExterno.getCategories() != null && !libroExterno.getCategories().isEmpty()) {
                        nuevoLibro.setGeneros(String.join(", ", libroExterno.getCategories()));
                    } else {
                        nuevoLibro.setGeneros("General");
                    }
                    
                    return libroRepository.save(nuevoLibro);
                });

        // Limpia relaciones anteriores (para permitir mover de estantería)
        eliminarLibroDeUsuario(usuarioId, libroLocal.getTitulo(), libroLocal.getAutor());

        // Si la acción es eliminar (o cancelar), no creamos la nueva relación
        if ("cancelar".equalsIgnoreCase(nombreEstanteria)) {
            return; 
        }

        // Busca estantería y guarda la relación
        Estanteria estanteria = estanteriaRepository.findByUsuario_IdUsuarioAndNombre(usuarioId, nombreEstanteria)
                .orElseThrow(() -> new RuntimeException("La estantería '" + nombreEstanteria + "' no existe para este usuario"));

        LibroEstanteria relacion = new LibroEstanteria();
        relacion.setEstanteria(estanteria);
        relacion.setLibro(libroLocal); 
        libroEstanteriaRepository.save(relacion);
    }

    @Transactional
    public void eliminarLibroDeUsuario(Long idUsuario, String titulo, String autor) {
        Optional<Libro> libro = libroRepository.findByTituloAndAutor(titulo, autor);
        if (libro.isPresent()) {
            libroEstanteriaRepository.deleteByLibroAndEstanteria_Usuario_IdUsuario(libro.get(), idUsuario);
        }
    }

    public Optional<String> obtenerNombreEstanteriaDelLibro(Long idUsuario, String titulo, String autor) {
        return libroRepository.findByTituloAndAutor(titulo, autor)
            .flatMap(libro -> libroEstanteriaRepository
                .findByLibroAndEstanteria_Usuario_IdUsuario(libro, idUsuario)
                .map(relacion -> relacion.getEstanteria().getNombre()));
    }

    public Estanteria crearEstanteria(Estanteria estanteria) {
        return estanteriaRepository.save(estanteria);
    }

    public Optional<Estanteria> buscarPorUsuarioYNombre(Long idUsuario, String nombre) {
        return estanteriaRepository.findByUsuario_IdUsuarioAndNombre(idUsuario, nombre);
    }

    public Estanteria guardar(Estanteria estanteria) {
        return estanteriaRepository.save(estanteria);
    }
}