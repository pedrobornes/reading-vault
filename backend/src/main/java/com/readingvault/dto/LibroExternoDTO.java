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
    // Numero de páginas
    private Integer pageCount;

    // URL de la imagen de portada
    private String coverId;

    // Valoración media
    private Double averageRating;

    // Numero de personas que han votado
    private Integer ratingsCount;

    // Descripción completa del libro
    private String description;
    
    // Cambiamos a 'publishedDate' para seguir la convención de Google/Controlador
    private String publishedDate;
    
    // ISBN
    private String isbn;

    // Lista de categorías (Géneros)
    private List<String> categories;

    // Campo auxiliar para facilitar el guardado
    private String nombrePrimerAutor;

    /**
     * Lógica para obtener siempre un autor válido al persistir el libro.
     */
    public String getNombrePrimerAutor() {
        if (nombrePrimerAutor != null && !nombrePrimerAutor.isEmpty()) {
            return nombrePrimerAutor;
        }
        return (authorNames != null && !authorNames.isEmpty()) 
                ? authorNames.get(0) 
                : "Autor desconocido";
    }

    public void setNombrePrimerAutor(String nombrePrimerAutor) {
        this.nombrePrimerAutor = nombrePrimerAutor;
    }
}