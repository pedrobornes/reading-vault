package com.readingvault.models;

import java.time.LocalDateTime;

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
    
    private String nombre;
    private String apellidos;
    private String fechaNacimiento;
    private String nombreUsuario;
    private String email;
    private String password;
    private String rol = "USER";
    private String fechaRegistro;
    private String fotoPerfil;
    private String localidad;   
    private String biografia;
    private LocalDateTime ultimaConexion;

    @ManyToOne 
    @JoinColumn(name = "id_genero")
    private Genero genero;
}
