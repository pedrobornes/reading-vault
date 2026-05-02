package com.readingvault.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(uniqueConstraints = {@jakarta.persistence.UniqueConstraint(columnNames = {"titulo", "autor"})})
public class Libro {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long idLibro;
    private String titulo;
    private String autor;
    private String isbn;
    
    @Column(columnDefinition = "TEXT") 
    private String descripcion;
    
    private String fechaPublicacion;
    private String fotoPortada;
    private String generos; 
    private Integer paginas; 
    private Integer votos = 0;
    private Double valoracion = 0.0;
}