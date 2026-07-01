package com.shoppablestream.backend.controllers;

import com.shoppablestream.backend.dto.DetectionResponse;
import com.shoppablestream.backend.services.MlServiceClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/video")
@CrossOrigin(origins = "http://localhost:5173") // Default Vite port
public class DetectionController {

    private final MlServiceClient mlServiceClient;

    public DetectionController(MlServiceClient mlServiceClient) {
        this.mlServiceClient = mlServiceClient;
    }

    @PostMapping("/analyze")
    public ResponseEntity<DetectionResponse> analyzeFrame(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            DetectionResponse response = mlServiceClient.detectObjects(
                    file.getBytes(),
                    file.getOriginalFilename()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            DetectionResponse errorResponse = new DetectionResponse();
            errorResponse.setStatus("error");
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
