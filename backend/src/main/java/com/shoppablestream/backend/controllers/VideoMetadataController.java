package com.shoppablestream.backend.controllers;

import com.shoppablestream.backend.models.VideoMetadata;
import com.shoppablestream.backend.repositories.VideoMetadataRepository;
import com.shoppablestream.backend.services.MlServiceClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/video-metadata")
@CrossOrigin(origins = "http://localhost:5173")
public class VideoMetadataController {

    private final MlServiceClient mlServiceClient;
    private final VideoMetadataRepository videoMetadataRepository;

    public VideoMetadataController(MlServiceClient mlServiceClient, VideoMetadataRepository videoMetadataRepository) {
        this.mlServiceClient = mlServiceClient;
        this.videoMetadataRepository = videoMetadataRepository;
    }

    @PostMapping("/upload")
    public ResponseEntity<VideoMetadata> uploadAndAnalyze(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            Map<String, Object> response = mlServiceClient.analyzeVideo(
                    file.getBytes(),
                    file.getOriginalFilename()
            );

            VideoMetadata metadata = new VideoMetadata();
            metadata.setFilename(file.getOriginalFilename());
            
            if ("success".equals(response.get("status"))) {
                metadata.setStatus("completed");
                metadata.setTimeline((Map<String, Object>) response.get("timeline"));
            } else {
                metadata.setStatus("error");
            }
            
            VideoMetadata saved = videoMetadataRepository.save(metadata);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<VideoMetadata> getMetadata(@PathVariable String id) {
        return videoMetadataRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
