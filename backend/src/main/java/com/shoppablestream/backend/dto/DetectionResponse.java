package com.shoppablestream.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class DetectionResponse {
    private String status;
    private List<Detection> detections;
    private String message; // in case of error

    @Data
    public static class Detection {
        private String label;
        private double confidence;
        private Box box;
    }

    @Data
    public static class Box {
        private double x1;
        private double y1;
        private double x2;
        private double y2;
    }
}
