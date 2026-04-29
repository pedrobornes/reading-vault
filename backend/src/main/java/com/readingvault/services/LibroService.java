package com.readingvault.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.readingvault.models.Libro;
import com.readingvault.repositories.LibroRepository;

@Service
public class LibroService {

    @Autowired
    private LibroRepository libroRepository;

    public List<Libro> listarTodos() {
        return libroRepository.findAll();
    }

    public List<Libro> buscarPorTitulo(String titulo) {
        return libroRepository.findByTituloContainingIgnoreCase(titulo);
    }

    public Libro guardarLibro(Libro libro) {
        return libroRepository.save(libro);
    }

    public Libro obtenerOCrear(String titulo, String autor, String fotoPortada) {
    // Buscamos si ya existe por título y autor para evitar duplicados
    return libroRepository.findByTituloAndAutor(titulo, autor)
        .orElseGet(() -> {
            Libro nuevo = new Libro();
            nuevo.setTitulo(titulo);
            nuevo.setAutor(autor);
            nuevo.setFotoPortada(fotoPortada);
            return libroRepository.save(nuevo);
        });
}
}