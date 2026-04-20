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
public class RetoLectura {
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idReto;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    private int year;
    private int objetivoLibros;
    private int completados;
}
