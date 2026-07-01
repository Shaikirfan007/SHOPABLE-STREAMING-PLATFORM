package com.shoppablestream.backend.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173") // Default Vite port
public class PlaceholderController {

    @GetMapping("/video-placeholder")
    public Map<String, String> getVideoPlaceholder() {
        return Map.of(
            "status", "success",
            "message", "Backend is connected!",
            "videoUrl", "https://www.w3schools.com/html/mov_bbb.mp4"
        );
    }
}
