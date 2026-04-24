package com.readingvault.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.readingvault.dto.LibroExternoDTO;
import com.readingvault.services.OpenLibraryService;

@RestController
@RequestMapping("/api/libros")
@CrossOrigin(origins = "*")
public class LibroController {

    @Autowired
    private OpenLibraryService openLibraryService;

    //buscador principal (mostrar datos de openLibrary)
    @GetMapping("/buscar")
    public List<LibroExternoDTO> buscar(@RequestParam(required = false) String titulo,
                                        @RequestParam(required = false) String autor,
                                        @RequestParam(required = false) String genero,
                                        @RequestParam(defaultValue = "1") int pagina) {
        return openLibraryService.buscarLibros(titulo, autor, genero, pagina);
    }
}