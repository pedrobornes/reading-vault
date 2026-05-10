package com.readingvault.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.readingvault.dto.LibroExternoDTO;
import com.readingvault.models.Genero;
import com.readingvault.models.Libro;
import com.readingvault.repositories.GeneroRepository;
import com.readingvault.repositories.LibroRepository;

@Service
public class LibroService {

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private GoogleBooksService googleBooksService;

    @Autowired
    private GeneroRepository generoRepository;

    // Sincroniza datos externos con locales (para el buscador híbrido)
    public List<Libro> enriquecerLibrosConDatosLocales(List<Libro> librosExternos) {
        for (Libro libroExt : librosExternos) {
            if (libroExt.getIsbn() != null) {
                libroRepository.findByIsbn(libroExt.getIsbn()).ifPresent(libroLocal -> {
                    libroExt.setIdLibro(libroLocal.getIdLibro());
                    libroExt.setValoracion(libroLocal.getValoracion());
                    libroExt.setVotos(libroLocal.getVotos());
                });
            }
        }
        return librosExternos;
    }

    public Libro obtenerOCrearPorIsbn(Libro datos) {
        return libroRepository.findByIsbn(datos.getIsbn())
            .orElseGet(() -> libroRepository.save(datos));
    }

    public List<Libro> listarTodos() {
        return libroRepository.findAll();
    }

    public Libro guardarLibro(Libro libro) {
        return libroRepository.save(libro);
    }

    /**
     * PRECARGA MASIVA OPTIMIZADA
     * Usa el nombre en inglés para Google pero guarda el nombre en español en la BD.
     */
    public void precargarLibrosPorGeneros() {
        List<Genero> generosOficiales = generoRepository.findAll();

        // 1. Array de letras para variar la búsqueda y obtener más resultados
        String[] letras = {"", " a", " e", " i", " o", " u", " n", " s"};
        int paginasPorGenero = 30; 

        for (Genero g : generosOficiales) {
            String nombreEspanol = g.getNombre();
            String nombreIngles = g.getNombreIngles();

            System.out.println("🚀 Iniciando precarga de: " + nombreEspanol);

            for (int i = 1; i <= paginasPorGenero; i++) {
                // 2. Usamos el módulo para rotar las letras en la query
                String letraVar = letras[i % letras.length];
                String query = "subject:\"" + nombreIngles + "\"" + letraVar;
                
                List<LibroExternoDTO> librosExternos = googleBooksService.buscarLibros(query, i, "relevance");

                if (librosExternos.isEmpty()) continue;

                for (LibroExternoDTO dto : librosExternos) {
                    
                    // FILTROS OPTIMIZADOS
                    boolean tieneIsbn = dto.getIsbn() != null;
                    boolean tienePortada = dto.getCoverId() != null && !dto.getCoverId().isEmpty();
                    // Quitamos la obligación de descripción para ganar volumen
                    boolean tienePaginas = dto.getPageCount() != null && dto.getPageCount() > 0;
                    
                    if (tieneIsbn && tienePortada && tienePaginas) {
                        
                        Optional<Libro> libroExistente = libroRepository.findByIsbn(dto.getIsbn());

                        if (libroExistente.isPresent()) {
                            Libro libroBD = libroExistente.get();
                            if (!libroBD.getGeneros().contains(nombreEspanol)) {
                                libroBD.setGeneros(libroBD.getGeneros() + ", " + nombreEspanol);
                                libroRepository.save(libroBD);
                            }
                        } else {
                            Libro nuevoLibro = new Libro();
                            nuevoLibro.setTitulo(dto.getTitle());
                            nuevoLibro.setAutor(dto.getAuthorNames() != null && !dto.getAuthorNames().isEmpty() 
                                ? dto.getAuthorNames().get(0) : "Autor desconocido");
                            nuevoLibro.setIsbn(dto.getIsbn());
                            
                            // 3. Manejo de descripción ausente
                            String desc = dto.getDescription();
                            if (desc == null || desc.equals("Sin descripción disponible.") || desc.isEmpty()) {
                                desc = "Sin sinopsis disponible para esta edición de " + nuevoLibro.getTitulo() + ".";
                            } else if (desc.length() > 4000) {
                                desc = desc.substring(0, 3995) + "...";
                            }
                            nuevoLibro.setDescripcion(desc);
                            
                            nuevoLibro.setFechaPublicacion(dto.getPublishedDate());
                            nuevoLibro.setFotoPortada(dto.getCoverId());
                            nuevoLibro.setPaginas(dto.getPageCount());
                            nuevoLibro.setGeneros(nombreEspanol);
                                    
                            nuevoLibro.setValoracion(dto.getAverageRating() != null ? dto.getAverageRating() : 0.0);
                            nuevoLibro.setVotos(dto.getRatingsCount() != null ? dto.getRatingsCount() : 0);

                            try {
                                libroRepository.save(nuevoLibro);
                            } catch (Exception e) {
                                // Silencioso para no ensuciar la consola
                            }
                        }
                    }
                }
                
                // Pausa corta para ir rápido pero seguro
                try { Thread.sleep(500); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            }
        }
        System.out.println("✅ PROCESO COMPLETADO: Miles de libros listos.");
    }
}