package com.shoppablestream.backend.controllers;

import com.shoppablestream.backend.models.VideoMetadata;
import com.shoppablestream.backend.repositories.VideoMetadataRepository;
import com.shoppablestream.backend.services.MlServiceClient;
import com.shoppablestream.backend.services.TwelveLabsService;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/video-metadata")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "*"})
public class VideoMetadataController {

    private final MlServiceClient mlServiceClient;
    private final VideoMetadataRepository videoMetadataRepository;
    private final MongoTemplate mongoTemplate;
    public VideoMetadataController(MlServiceClient mlServiceClient, VideoMetadataRepository videoMetadataRepository, MongoTemplate mongoTemplate) {
        this.mlServiceClient = mlServiceClient;
        this.videoMetadataRepository = videoMetadataRepository;
        this.mongoTemplate = mongoTemplate;
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

    @GetMapping("/by-filename")
    public ResponseEntity<org.bson.Document> getMetadataByFilename(@RequestParam("name") String filename) {
        Query query = new Query(Criteria.where("filename").is(filename));
        org.bson.Document result = mongoTemplate.findOne(query, org.bson.Document.class, "videoMetadata");
        if (result != null) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<VideoMetadata> getMetadata(@PathVariable String id) {
        System.out.println("HIT /{id} WITH id: " + id);
        return videoMetadataRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> {
                System.out.println("NOT FOUND for id: " + id);
                return ResponseEntity.notFound().build();
            });
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchVideo(@RequestParam("query") String query) {
        // Semantic search migrated to local ML service (placeholder)
        return ResponseEntity.ok(Map.of("message", "Semantic search is now handled locally."));
    }

    @GetMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeVideo(@RequestParam("videoId") String videoId) {
        // Generative analysis migrated to local ML service (placeholder)
        return ResponseEntity.ok(Map.of("message", "Video analysis is now handled locally by SAM3."));
    }
}
