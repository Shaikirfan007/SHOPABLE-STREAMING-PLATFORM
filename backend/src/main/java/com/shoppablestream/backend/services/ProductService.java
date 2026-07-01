package com.shoppablestream.backend.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shoppablestream.backend.dto.ProductDTO;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.*;

@Service
public class ProductService {

    private final List<ProductDTO> catalog = new ArrayList<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void loadCatalog() {
        try {
            ClassPathResource resource = new ClassPathResource("products.json");
            ProductDTO[] items = objectMapper.readValue(resource.getInputStream(), ProductDTO[].class);
            catalog.addAll(Arrays.asList(items));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public ProductDTO searchProductByLabel(String label) {
        if (label == null || label.isBlank()) return null;
        String normalized = label.toLowerCase().trim();

        // Exact match on label field
        for (ProductDTO p : catalog) {
            if (p.getLabel() != null && p.getLabel().equalsIgnoreCase(normalized)) {
                return p;
            }
        }

        // Partial title match as fallback
        for (ProductDTO p : catalog) {
            if (p.getTitle() != null && p.getTitle().toLowerCase().contains(normalized)) {
                return p;
            }
        }

        // Return first item as last resort so UI always shows something
        return catalog.isEmpty() ? null : catalog.get(0);
    }
}
