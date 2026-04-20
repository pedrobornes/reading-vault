package com.readingvault.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Data
@Entity
public class Libro {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long idLibro;
    private String titulo;
    private String autor;
    private String isbn;
    @Column(columnDefinition = "TEXT") // Para descripciones largas
    private String descripcion;
    private String fechaPublicacion;
}
