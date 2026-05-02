package com.readingvault.controllers;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.readingvault.dto.LibroExternoDTO;
import com.readingvault.models.Libro;
import com.readingvault.repositories.LibroRepository;
import com.readingvault.services.GoogleBooksService;

@RestController
@RequestMapping("/api/libros")
@CrossOrigin(origins = "*")
public class LibroController {

    @Autowired
    private GoogleBooksService googleBooksService;

    @Autowired
    private LibroRepository libroRepository;

    /**
     * Mapea un Libro de nuestra base de datos al formato del Frontend.
     */
    private Map<String, Object> mapearLibroLocal(Libro libro) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("idLibro", libro.getIdLibro());
        respuesta.put("titulo", libro.getTitulo());
        respuesta.put("autor", libro.getAutor());
        respuesta.put("portada", libro.getFotoPortada());
        respuesta.put("fotoPortada", libro.getFotoPortada());
        respuesta.put("valoracion", libro.getValoracion());
        respuesta.put("votos", libro.getVotos());
        respuesta.put("descripcion", libro.getDescripcion());
        respuesta.put("isbn", libro.getIsbn());
        respuesta.put("fechaPublicacion", libro.getFechaPublicacion());
        respuesta.put("paginas", libro.getPaginas());
        respuesta.put("generos", libro.getGeneros());
        return respuesta;
    }

    /**
     * Mapea los datos de la API externa.
     */
    private Map<String, Object> mapearLibro(LibroExternoDTO libro) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("titulo", libro.getTitle());
        respuesta.put("autor", (libro.getAuthorNames() != null && !libro.getAuthorNames().isEmpty())
                ? libro.getAuthorNames().get(0)
                : "Autor desconocido");
        
        respuesta.put("portada", libro.getCoverId());
        respuesta.put("fotoPortada", libro.getCoverId());
        respuesta.put("valoracion", libro.getAverageRating());
        respuesta.put("votos", libro.getRatingsCount());
        respuesta.put("descripcion", libro.getDescription()); 
        respuesta.put("isbn", libro.getIsbn());
        respuesta.put("fechaPublicacion", libro.getPublishedDate());
        respuesta.put("paginas", libro.getPageCount());
        
        String categoriasStr = (libro.getCategories() != null) 
                ? String.join(", ", libro.getCategories()) 
                : "General";
        respuesta.put("generos", categoriasStr);
        return respuesta;
    }

    /**
     * Busca libros filtrando por ISBN y eliminando duplicados en el servidor.
     */
    @GetMapping("/buscar")
    public List<Map<String, Object>> buscar(
            @RequestParam String q,
            @RequestParam(defaultValue = "1") int pagina,
            @RequestParam(defaultValue = "relevance") String orderBy) {

        // 1. Obtenemos los resultados de Google
        List<LibroExternoDTO> librosExternos = googleBooksService.buscarLibros(q, pagina, orderBy);

        // 2. Usamos un LinkedHashMap para mantener el orden y asegurar ISBN único
        // Solo aceptamos libros que tengan ISBN informado
        Map<String, LibroExternoDTO> filtrados = new LinkedHashMap<>();
        
        for (LibroExternoDTO dto : librosExternos) {
            String isbn = dto.getIsbn();
            if (isbn != null && !isbn.isEmpty() && !isbn.equalsIgnoreCase("null")) {
                // putIfAbsent evita que ediciones duplicadas sobrescriban la primera aparición
                filtrados.putIfAbsent(isbn, dto);
            }
        }

        // 3. Mapeamos la lista limpia
        return filtrados.values().stream()
                .limit(12)
                .map(this::mapearLibro)
                .collect(Collectors.toList());
    }

    /**
     * Busca un libro específico prioritariamente por ISBN.
     */
    @GetMapping("/buscar-unico")
    public ResponseEntity<?> buscarUnico(
            @RequestParam(required = false) String isbn,
            @RequestParam(required = false) String titulo, 
            @RequestParam(required = false) String autor) {
        
        // 1. Intentar buscar en la BD Local por ISBN (es lo más seguro)
        if (isbn != null && !isbn.isEmpty()) {
            Optional<Libro> porIsbn = libroRepository.findByIsbn(isbn);
            if (porIsbn.isPresent()) {
                return ResponseEntity.ok(mapearLibroLocal(porIsbn.get()));
            }
        }

        // 2. Si no hay ISBN o no se encontró, intentar por Título y Autor en BD Local
        if (titulo != null && autor != null) {
            Optional<Libro> porDatos = libroRepository.findByTituloAndAutor(titulo, autor);
            if (porDatos.isPresent()) {
                return ResponseEntity.ok(mapearLibroLocal(porDatos.get()));
            }
        }

        // 3. Si no existe localmente, ir a Google Books (preferiblemente por ISBN)
        String queryBusqueda = (isbn != null && !isbn.isEmpty()) ? "isbn:" + isbn : titulo + " " + autor;
        List<LibroExternoDTO> resultados = googleBooksService.buscarLibros(queryBusqueda, 1, "relevance");
        
        if (resultados != null && !resultados.isEmpty()) {
            return ResponseEntity.ok(mapearLibro(resultados.get(0)));
        }
        
        return ResponseEntity.notFound().build();
    }
}