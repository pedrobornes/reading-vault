package com.readingvault.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.readingvault.dto.LibroExternoDTO;
import com.readingvault.services.GoogleBooksService;

@RestController
@RequestMapping("/api/libros")
@CrossOrigin(origins = "*")
public class LibroController {

    @Autowired
    private GoogleBooksService googleBooksService;

    @GetMapping("/buscar")
    public List<Map<String, Object>> buscar(
            @RequestParam String q,
            @RequestParam(defaultValue = "1") int pagina,
            @RequestParam(defaultValue = "relevance") String orderBy) {

        List<LibroExternoDTO> librosExternos = googleBooksService.buscarLibros(q, pagina, orderBy);

        return librosExternos.stream().map(libro -> {
            Map<String, Object> respuesta = new HashMap<>();
            
            respuesta.put("titulo", libro.getTitle());
            respuesta.put("portada", libro.getCoverId());

            String nombreAutor = (libro.getAuthorNames() != null && !libro.getAuthorNames().isEmpty())
                    ? libro.getAuthorNames().get(0)
                    : "Autor desconocido";
            respuesta.put("autor", nombreAutor);
            
            respuesta.put("valoracion", libro.getAverageRating());

            return respuesta;
        }).collect(Collectors.toList());
    }
}