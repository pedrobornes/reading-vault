package com.readingvault.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.readingvault.models.Genero;
import com.readingvault.repositories.GeneroRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private GeneroRepository generoRepository;

    @Override
    public void run(String... args) throws Exception {
        // Solo poblamos si la tabla está vacía
        if (generoRepository.count() == 0) {
            List<Genero> generos = List.of(
                new Genero("Arte", "Art"),
                new Genero("Autoayuda", "Self-Help"),
                new Genero("Biografía", "Biography & Autobiography"),
                new Genero("Ciencia Ficción", "Fiction / Science Fiction"),
                new Genero("Clásicos", "Fiction / Classics"),
                new Genero("Crimen", "True Crime"),
                new Genero("Fantasía", "Fiction / Fantasy"),
                new Genero("Ficción", "Fiction"),
                new Genero("Historia", "History"),
                new Genero("Comedia", "Fiction / Humorous"),
                new Genero("Infantil", "Juvenile Fiction"),
                new Genero("Misterio", "Fiction / Mystery & Detective"),
                new Genero("Paranormal", "Fiction / Paranormal"),
                new Genero("Poesía", "Poetry"),
                new Genero("Romance", "Fiction / Romance"),
                new Genero("Suspense", "Fiction / Suspense"),
                new Genero("Terror", "Fiction / Horror"),
                new Genero("Thriller", "Fiction / Thriller")
            );

            generoRepository.saveAll(generos);
            System.out.println(">> Géneros oficiales de Google Books inicializados correctamente.");
        }
    }
}