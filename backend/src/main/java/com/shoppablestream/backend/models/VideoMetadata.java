package com.shoppablestream.backend.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Data
@Document(collection = "video_metadata")
public class VideoMetadata {
    
    @Id
    private String id;
    private String filename;
    private String status; // e.g., "processing", "completed", "error"
    
    // Timeline maps a second (e.g., "0", "1", "2") to a list of detections
    private Map<String, Object> timeline;
}
