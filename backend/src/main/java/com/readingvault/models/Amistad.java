package com.readingvault.models;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;


@Data
@Entity
public class Amistad {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id;

    @ManyToOne
    @JoinColumn(name = "usuario1_id") 
    private Usuario usuario1;

    @ManyToOne 
    @JoinColumn(name = "usuario2_id") 
    private Usuario usuario2;

    private String estado; // "PENDIENTE", "ACEPTADA"
    
    private LocalDate fecha; 
}
