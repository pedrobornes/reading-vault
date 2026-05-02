package com.readingvault.services;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.readingvault.dto.LibroExternoDTO;

@Service
public class GoogleBooksService {

    @Value("${google.books.api.key}")
    private String apiKey;

    private final String GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes";
    private final RestTemplate restTemplate = new RestTemplate();

    public List<LibroExternoDTO> buscarLibros(String query, int pagina, String orderBy) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(GOOGLE_BOOKS_URL);

        builder.queryParam("q", query);
        builder.queryParam("maxResults", 40); 
        builder.queryParam("startIndex", (pagina - 1) * 12); 
        
        // Idioma
        builder.queryParam("langRestrict", "es"); // Restringe o prioriza resultados en español
        builder.queryParam("hl", "es");

        if (orderBy != null && !orderBy.isEmpty()) {
            builder.queryParam("orderBy", orderBy);
        }
        
        builder.queryParam("key", apiKey);

        try {
            Map<String, Object> response = restTemplate.getForObject(builder.build().toUri(), Map.class);
            if (response == null || !response.containsKey("items")) return List.of();

            List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");

            return items.stream().map(item -> {
                Map<String, Object> volumeInfo = (Map<String, Object>) item.get("volumeInfo");
                LibroExternoDTO dto = new LibroExternoDTO();

                // Título y Autores
                dto.setTitle(String.valueOf(volumeInfo.getOrDefault("title", "Sin título")));
                if (volumeInfo.containsKey("authors")) {
                    dto.setAuthorNames((List<String>) volumeInfo.get("authors"));
                }

                // Valoración
                if (volumeInfo.containsKey("averageRating")) {
                    dto.setAverageRating(Double.parseDouble(volumeInfo.get("averageRating").toString()));
                } else {
                    dto.setAverageRating(0.0);
                }

                // Votos
                if (volumeInfo.containsKey("ratingsCount")) {
                    dto.setRatingsCount((Integer) volumeInfo.get("ratingsCount"));
                } else {
                    dto.setRatingsCount(0);
                }

                // Descripción
                dto.setDescription(String.valueOf(volumeInfo.getOrDefault("description", "Sin descripción disponible.")));

                // Número de páginas
                if (volumeInfo.containsKey("pageCount")) {
                    dto.setPageCount((Integer) volumeInfo.get("pageCount"));
                }

                // Fecha de publicación
                dto.setPublishedDate(String.valueOf(volumeInfo.getOrDefault("publishedDate", "Fecha desconocida")));

                // Categorías / Géneros
                if (volumeInfo.containsKey("categories")) {
                    dto.setCategories((List<String>) volumeInfo.get("categories"));
                }

                // ISBN
                if (volumeInfo.containsKey("industryIdentifiers")) {
                    List<Map<String, String>> ids = (List<Map<String, String>>) volumeInfo.get("industryIdentifiers");
                    for (Map<String, String> id : ids) {
                        if ("ISBN_13".equals(id.get("type"))) {
                            dto.setIsbn(id.get("identifier"));
                        }
                    }
                }

                // Portada
                if (volumeInfo.containsKey("imageLinks")) {
                    Map<String, String> images = (Map<String, String>) volumeInfo.get("imageLinks");
                    String coverUrl = images.get("thumbnail");
                    if (coverUrl != null) {
                        dto.setCoverId(coverUrl.replace("http://", "https://"));
                    }
                }
                
                return dto;
            }).collect(Collectors.toList());

        } catch (Exception e) {
            return List.of();
        }
    }
}