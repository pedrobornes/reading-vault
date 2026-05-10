package com.readingvault.services;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.readingvault.models.Libro;
import com.readingvault.models.Review;
import com.readingvault.models.Usuario;
import com.readingvault.repositories.LibroRepository;
import com.readingvault.repositories.ReviewRepository;
import com.readingvault.repositories.UsuarioRepository;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<Review> obtenerReviewsPorLibro(Long idLibro) {
        return reviewRepository.findByLibroIdLibro(idLibro);
    }

    /**
     * Procesa tanto el voto como el contenido de la reseña.
     * Actualiza la valoración media y el conteo de votos del libro.
     */
    @Transactional // Importante para asegurar que se guarde todo o nada
    public Review registrarVotoOReview(Long idUsuario, Integer puntuacion, String contenido, Libro libroData) {
        
        // 1. Asegurar que el libro existe localmente
        Libro libro = libroRepository.findByIsbn(libroData.getIsbn())
            .orElseGet(() -> libroRepository.save(libroData));

        // 2. Obtener el usuario
        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 3. Buscar si ya existe una review previa
        Optional<Review> reviewOpt = reviewRepository.findByUsuario_IdUsuarioAndLibro_IdLibro(idUsuario, libro.getIdLibro());
        Review review = reviewOpt.orElse(new Review());
        
        // Guardamos la puntuación antigua para el cálculo posterior si es una edición
        Integer puntuacionAnterior = reviewOpt.isPresent() ? review.getPuntuacion() : null;

        // 4. Actualizar campos de la review
        review.setUsuario(usuario);
        review.setLibro(libro);
        review.setPuntuacion(puntuacion);
        
        if (contenido != null) {
            review.setContenido(contenido);
        }
        
        if (review.getFecha() == null) {
            review.setFecha(LocalDate.now().toString()); 
        }

        Review savedReview = reviewRepository.save(review);

        // 5. LÓGICA DE ACTUALIZACIÓN DEL LIBRO
        actualizarEstadisticasLibro(libro, puntuacion, puntuacionAnterior);

        return savedReview;
    }

    /**
     * Recalcula la valoración media y el total de votos del libro.
     */
    private void actualizarEstadisticasLibro(Libro libro, Integer nuevaPuntuacion, Integer puntuacionAnterior) {
        double valoracionActual = libro.getValoracion();
        int votosActuales = libro.getVotos();

        if (puntuacionAnterior == null) {
            // Caso 1: Es una review nueva
            double nuevaMedia = ((valoracionActual * votosActuales) + nuevaPuntuacion) / (votosActuales + 1);
            libro.setVotos(votosActuales + 1);
            libro.setValoracion(nuevaMedia);
        } else {
            // Caso 2: El usuario está editando su nota (cambiamos una nota por otra)
            double nuevaMedia = ((valoracionActual * votosActuales) - puntuacionAnterior + nuevaPuntuacion) / votosActuales;
            libro.setValoracion(nuevaMedia);
        }

        libroRepository.save(libro);
    }
}