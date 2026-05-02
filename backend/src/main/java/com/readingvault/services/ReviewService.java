package com.readingvault.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
     * Si el libro no existe en la BD local, lo crea usando el ISBN.
     */
    public Review registrarVotoOReview(Long idUsuario, Integer puntuacion, String contenido, Libro libroData) {
        
        // 1. Asegurar que el libro existe en nuestra BD local usando el ISBN
        Libro libro = libroRepository.findByIsbn(libroData.getIsbn())
            .orElseGet(() -> {
                // Si no existe, lo persistimos con los datos que vienen del frontend
                return libroRepository.save(libroData);
            });

        // 2. Obtener el usuario (debe existir por el login)
        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 3. Buscar si ya existe una review previa de este usuario para este libro
        Review review = reviewRepository.findByUsuario_IdUsuarioAndLibro_IdLibro(idUsuario, libro.getIdLibro())
            .orElse(new Review());

        // 4. Actualizar los campos
        review.setUsuario(usuario);
        review.setLibro(libro);
        review.setPuntuacion(puntuacion);
        
        if (contenido != null) {
            review.setContenido(contenido);
        }
        
        // Asignamos la fecha actual si es una review nueva
        if (review.getFecha() == null) {
            review.setFecha(LocalDate.now().toString()); 
        }

        return reviewRepository.save(review);
    }
}