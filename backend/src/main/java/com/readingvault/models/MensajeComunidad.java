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
public class MensajeComunidad {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
   private Long idMensaje;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_comunidad")
    private Comunidad comunidad;

    private String contenido;
    private String fecha;
}
