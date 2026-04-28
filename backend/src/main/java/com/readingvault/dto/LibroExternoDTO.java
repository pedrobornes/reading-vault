package com.readingvault.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class LibroExternoDTO {

    // Título del libro
    private String title;

    // Lista de autores
    private List<String> authorNames;

    // Número de páginas
    private int numberOfPages;

    // URL de la imagen
    private String coverId;

    // Valoración media de Google Books
    private double averageRating;

    public String getNombrePrimerAutor() {
        return (authorNames != null && !authorNames.isEmpty()) ? authorNames.get(0) : "Autor desconocido";
    }
}