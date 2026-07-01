package com.shoppablestream.backend.controllers;

import com.shoppablestream.backend.dto.ProductDTO;
import com.shoppablestream.backend.services.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/search")
    public ResponseEntity<ProductDTO> searchProduct(@RequestParam("query") String query) {
        ProductDTO product = productService.searchProductByLabel(query);
        if (product != null) {
            return ResponseEntity.ok(product);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
