package com.readingvault.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.readingvault.dto.LibroExternoDTO;
import com.readingvault.models.Libro;
import com.readingvault.repositories.LibroRepository;
import com.readingvault.services.GoogleBooksService;
import com.readingvault.services.LibroService;

@RestController
@RequestMapping("/api/libros")
@CrossOrigin(origins = "*")
public class LibroController {

    @Autowired
    private GoogleBooksService googleBooksService;

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private LibroService libroService;

    // Mapeo local a Map
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
        respuesta.put("fuente", "local");
        return respuesta;
    }

    // Mapeo Google a Map
    private Map<String, Object> mapearLibro(LibroExternoDTO libro) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("titulo", libro.getTitle());
        respuesta.put("autor", (libro.getAuthorNames() != null && !libro.getAuthorNames().isEmpty())
                ? libro.getAuthorNames().get(0) : "Autor desconocido");
        respuesta.put("portada", libro.getCoverId());
        respuesta.put("fotoPortada", libro.getCoverId());
        respuesta.put("valoracion", libro.getAverageRating());
        respuesta.put("votos", libro.getRatingsCount());
        respuesta.put("descripcion", libro.getDescription()); 
        respuesta.put("isbn", libro.getIsbn());
        respuesta.put("fechaPublicacion", libro.getPublishedDate());
        respuesta.put("paginas", libro.getPageCount());
        respuesta.put("generos", (libro.getCategories() != null) ? String.join(", ", libro.getCategories()) : "General");
        return respuesta;
    }

    // Mapeo híbrido: junta Google con BD
    private Map<String, Object> mapearYEnriquecerLibro(LibroExternoDTO libroExt) {
        Map<String, Object> respuesta = new HashMap<>();
        String isbn = libroExt.getIsbn();

        respuesta.put("titulo", libroExt.getTitle());
        respuesta.put("autor", libroExt.getNombrePrimerAutor());
        respuesta.put("portada", libroExt.getCoverId());
        respuesta.put("fotoPortada", libroExt.getCoverId());
        respuesta.put("descripcion", libroExt.getDescription()); 
        respuesta.put("isbn", isbn);
        respuesta.put("fechaPublicacion", libroExt.getPublishedDate());
        respuesta.put("paginas", libroExt.getPageCount());
        
        String categoriasStr = (libroExt.getCategories() != null) 
                ? String.join(", ", libroExt.getCategories()) : "General";
        respuesta.put("generos", categoriasStr);

        Optional<Libro> localOpt = libroRepository.findByIsbn(isbn);
        if (localOpt.isPresent()) {
            Libro local = localOpt.get();
            respuesta.put("valoracion", local.getValoracion());
            respuesta.put("votos", local.getVotos());
            respuesta.put("idLibro", local.getIdLibro());
            respuesta.put("fuente", "local");
        } else {
            respuesta.put("valoracion", libroExt.getAverageRating());
            respuesta.put("votos", libroExt.getRatingsCount());
            respuesta.put("fuente", "google");
        }
        return respuesta;
    }

    // Búsqueda separada: Género = BD, Manual = API
    @GetMapping("/buscar")
    public List<Map<String, Object>> buscar(
            @RequestParam String q,
            @RequestParam(defaultValue = "1") int pagina,
            @RequestParam(defaultValue = "false") boolean isGenero,
            @RequestParam(defaultValue = "relevance") String orderBy) {

        String queryLimpia = q.trim();
        int tamañoPagina = 12; 

        if (isGenero) {
            // GÉNERO: 100% LOCAL
            List<Libro> locales = libroRepository.findByTituloContainingIgnoreCaseOrAutorContainingIgnoreCaseOrGenerosContainingIgnoreCase(
                queryLimpia, queryLimpia, queryLimpia
            );

            // Ordenación local
            if ("rating".equals(orderBy)) {
                locales.sort((a, b) -> Double.compare(
                    b.getValoracion() != null ? b.getValoracion() : 0.0,
                    a.getValoracion() != null ? a.getValoracion() : 0.0
                ));
            }

            return locales.stream()
                    .skip((long) (pagina - 1) * tamañoPagina)
                    .limit(tamañoPagina)
                    .map(this::mapearLibroLocal)
                    .collect(Collectors.toList());

        } else {
            // MANUAL: 100% GOOGLE BOOKS
            String googleOrder = orderBy.equals("rating") ? "relevance" : orderBy;
            List<LibroExternoDTO> googleBooks = googleBooksService.buscarLibros(queryLimpia, pagina, googleOrder);

            List<Map<String, Object>> respuesta = googleBooks.stream()
                    .limit(tamañoPagina)
                    .map(this::mapearYEnriquecerLibro)
                    .collect(Collectors.toList());

            // Ordenación API
            if ("rating".equals(orderBy)) {
                respuesta.sort((a, b) -> Double.compare(
                    (Double) b.getOrDefault("valoracion", 0.0),
                    (Double) a.getOrDefault("valoracion", 0.0)
                ));
            }

            return respuesta;
        }
    }

    // Búsqueda única
    @GetMapping("/buscar-unico")
    public ResponseEntity<?> buscarUnico(
            @RequestParam(required = false) String isbn,
            @RequestParam(required = false) String titulo, 
            @RequestParam(required = false) String autor) {
        
        if (isbn != null && !isbn.isEmpty()) {
            Optional<Libro> porIsbn = libroRepository.findByIsbn(isbn);
            if (porIsbn.isPresent()) return ResponseEntity.ok(mapearLibroLocal(porIsbn.get()));
        }

        if (titulo != null && autor != null) {
            Optional<Libro> porDatos = libroRepository.findByTituloAndAutor(titulo, autor);
            if (porDatos.isPresent()) return ResponseEntity.ok(mapearLibroLocal(porDatos.get()));
        }

        String queryBusqueda = (isbn != null && !isbn.isEmpty()) ? "isbn:" + isbn : titulo + " " + autor;
        List<LibroExternoDTO> resultados = googleBooksService.buscarLibros(queryBusqueda, 1, "relevance");
        
        if (resultados != null && !resultados.isEmpty()) {
            return ResponseEntity.ok(mapearLibro(resultados.get(0)));
        }
        
        return ResponseEntity.notFound().build();
    }

    // Endpoint silencioso para asegurar que un libro visto exista en BD y actualizar datos faltantes
    @PostMapping("/sincronizar")
    public ResponseEntity<?> sincronizarLibroLocal(@RequestBody Map<String, Object> libroData) {
        String isbn = (String) libroData.get("isbn");
        String titulo = (String) libroData.get("titulo");
        String autor = (String) libroData.get("autor");
        
        if (titulo == null || autor == null) {
            return ResponseEntity.badRequest().build();
        }

        // 1. Buscar si ya existe por ISBN o por Título y Autor
        Optional<Libro> existe = Optional.empty();
        if (isbn != null && !isbn.isEmpty()) {
            existe = libroRepository.findByIsbn(isbn);
        }
        if (existe.isEmpty()) {
            existe = libroRepository.findByTituloAndAutor(titulo, autor);
        }
        
        if (existe.isEmpty()) {
            // 2. Si no existe de ninguna forma, lo creamos de cero
            Libro nuevo = new Libro();
            nuevo.setIsbn(isbn);
            nuevo.setTitulo(titulo);
            nuevo.setAutor(autor);
            
            String desc = (String) libroData.get("descripcion");
            if (desc == null) desc = (String) libroData.get("description");
            nuevo.setDescripcion(desc != null ? desc : "Sin descripción.");
            
            nuevo.setFotoPortada((String) libroData.get("portada"));
            nuevo.setFechaPublicacion((String) libroData.get("fechaPublicacion"));
            nuevo.setGeneros((String) libroData.getOrDefault("generos", "General"));
            
            nuevo.setPaginas(libroData.get("paginas") != null ? Integer.parseInt(libroData.get("paginas").toString()) : 0);
            if (libroData.get("valoracion") != null) nuevo.setValoracion(Double.parseDouble(libroData.get("valoracion").toString()));
            if (libroData.get("votos") != null) nuevo.setVotos(Integer.parseInt(libroData.get("votos").toString()));
            
            libroRepository.save(nuevo);
            
        } else {
            // 3. ¡AUTO-REPARACIÓN! Si existe pero le faltan datos, los completamos
            Libro libroGuardado = existe.get();
            boolean necesitaActualizar = false;

            if ((libroGuardado.getIsbn() == null || libroGuardado.getIsbn().isEmpty()) && isbn != null && !isbn.isEmpty()) {
                libroGuardado.setIsbn(isbn);
                necesitaActualizar = true;
            }
            if ((libroGuardado.getFechaPublicacion() == null || libroGuardado.getFechaPublicacion().isEmpty()) && libroData.get("fechaPublicacion") != null) {
                libroGuardado.setFechaPublicacion((String) libroData.get("fechaPublicacion"));
                necesitaActualizar = true;
            }

            // Si le faltaba algo, guardamos los cambios silenciosamente
            if (necesitaActualizar) {
                libroRepository.save(libroGuardado);
            }
        }
        
        return ResponseEntity.ok().build();
    }

    // Precarga
    @GetMapping("/precargar-bd")
    public ResponseEntity<String> precargarBaseDeDatos() {
        new Thread(() -> {
            System.out.println("⏳ Iniciando precarga masiva...");
            libroService.precargarLibrosPorGeneros();
        }).start();

        return ResponseEntity.ok("Proceso iniciado.");
    }
}