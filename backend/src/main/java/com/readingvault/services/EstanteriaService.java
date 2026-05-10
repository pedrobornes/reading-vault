package com.readingvault.services;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
    private GoogleBooksService googleBooksService;

    @Autowired
    private EstanteriaRepository estanteriaRepository;

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private LibroEstanteriaRepository libroEstanteriaRepository;

    @Transactional
    public void agregarLibroAEstanteria(Map<String, Object> libroData, Long usuarioId, String nombreEstanteria) {
        String titulo = (String) libroData.get("titulo");
        String autor = (String) libroData.get("autor");
        String isbn = (String) libroData.get("isbn");

        // 1. Intentamos buscar en nuestra BD local
        Optional<Libro> libroOpt = (isbn != null && !isbn.isEmpty()) 
            ? libroRepository.findByIsbn(isbn) 
            : libroRepository.findByTituloAndAutor(titulo, autor);

        Libro libroLocal;

        if (libroOpt.isPresent()) {
            libroLocal = libroOpt.get();
        } else {
            // 2. Si no está en BD, necesitamos el libro COMPLETO antes de insertar
            // Hacemos una búsqueda específica en la API para obtener todos los campos
            String queryEnriquecer = (isbn != null && !isbn.isEmpty()) ? "isbn:" + isbn : "intitle:\"" + titulo + "\" inauthor:\"" + autor + "\"";
            var resultadosFull = googleBooksService.buscarLibros(queryEnriquecer, 1, "relevance");

            Libro nuevoLibro = new Libro();
            
            if (resultadosFull != null && !resultadosFull.isEmpty()) {
                // Usamos los datos enriquecidos de la API
                var libroFull = resultadosFull.get(0);
                nuevoLibro.setTitulo(libroFull.getTitle());
                nuevoLibro.setAutor(libroFull.getNombrePrimerAutor());
                nuevoLibro.setIsbn(libroFull.getIsbn());
                nuevoLibro.setFechaPublicacion(libroFull.getPublishedDate());
                nuevoLibro.setPaginas(libroFull.getPageCount());
                nuevoLibro.setDescripcion(libroFull.getDescription());
                nuevoLibro.setFotoPortada(libroFull.getCoverId());
                nuevoLibro.setValoracion(libroFull.getAverageRating());
                nuevoLibro.setVotos(libroFull.getRatingsCount());
            } else {
                // Fallback: Si Google no devuelve nada raro, usamos lo que venía del front
                nuevoLibro.setTitulo(titulo);
                nuevoLibro.setAutor(autor);
                nuevoLibro.setIsbn(isbn);
                nuevoLibro.setFotoPortada((String) libroData.get("portada"));
                nuevoLibro.setDescripcion((String) libroData.getOrDefault("descripcion", "Sin descripción."));
            }

            // Mantenemos tus géneros del frontend
            String generosFront = (String) libroData.get("generos");
            nuevoLibro.setGeneros(generosFront != null ? generosFront : "General");

            libroLocal = libroRepository.save(nuevoLibro);
        }

        // 3. Gestionar la estantería del usuario
        eliminarLibroDeUsuario(usuarioId, libroLocal.getTitulo(), libroLocal.getAutor());

        if (!"cancelar".equalsIgnoreCase(nombreEstanteria)) {
            Estanteria estanteria = estanteriaRepository.findByUsuario_IdUsuarioAndNombre(usuarioId, nombreEstanteria)
                .orElseThrow(() -> new RuntimeException("Estantería no encontrada"));

            LibroEstanteria relacion = new LibroEstanteria();
            relacion.setEstanteria(estanteria);
            relacion.setLibro(libroLocal); 
            libroEstanteriaRepository.save(relacion);
        }
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