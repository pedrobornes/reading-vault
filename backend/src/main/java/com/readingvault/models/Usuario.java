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
public class Usuario {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long idUsuario;
    
    @ManyToOne 
    @JoinColumn(name = "id_genero")
    private Genero genero;

    private String nombre;
    private String email;
    private String password;
    private String rol; 
    private String fechaRegistro;
    private String fotoPerfil;
}
