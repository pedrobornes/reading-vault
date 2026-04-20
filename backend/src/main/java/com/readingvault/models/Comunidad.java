package com.readingvault.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Data
@Entity
public class Comunidad {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long idComunidad;

    @ManyToOne
    @JoinColumn(name = "id_libro")
    private Libro libro; //la comunidad es de un libro

    private String nombre;
    private String descripcion;
    private String fechaCreacion;
}
