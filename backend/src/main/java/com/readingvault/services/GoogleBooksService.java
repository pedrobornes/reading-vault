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

    public List<LibroExternoDTO> buscarLibros(String query, int pagina) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(GOOGLE_BOOKS_URL);

        // Google busca por defecto en todos los campos
        builder.queryParam("q", query);
        builder.queryParam("maxResults", 20);
        builder.queryParam("startIndex", (pagina - 1) * 20);
        builder.queryParam("key", apiKey);

        try {
            Map<String, Object> response = restTemplate.getForObject(builder.build().toUri(), Map.class);
            if (response == null || !response.containsKey("items")) return List.of();

            List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");

            return items.stream().map(item -> {
                Map<String, Object> volumeInfo = (Map<String, Object>) item.get("volumeInfo");
                LibroExternoDTO dto = new LibroExternoDTO();

                dto.setTitle(String.valueOf(volumeInfo.getOrDefault("title", "Sin título")));

                if (volumeInfo.containsKey("authors")) {
                    dto.setAuthorNames((List<String>) volumeInfo.get("authors"));
                }

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