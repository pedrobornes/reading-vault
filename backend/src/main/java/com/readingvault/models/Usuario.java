package com.readingvault.models;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import lombok.Data;

@Data
@Entity
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
    private Integer objetivoLectura = 0;
    private Integer rachaActual = 0;
    private LocalDate fechaUltimaActividad;
    // Privacidad
    private String privacidadPerfil = "Público";
    private String privacidadLibros = "Público";
    private String privacidadActividad = "Público";
    private String privacidadDatos = "Privado";

    // Relación N:M para múltiples géneros favoritos
    @ManyToMany
    @JoinTable(
        name = "usuario_genero", // Tabla intermedia
        joinColumns = @JoinColumn(name = "id_usuario"), 
        inverseJoinColumns = @JoinColumn(name = "id_genero")
    )
    private Set<Genero> generosFavoritos = new HashSet<>();
}