package com.shoppablestream.backend.services;

import com.shoppablestream.backend.dto.DetectionResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class MlServiceClient {

    private final WebClient webClient;

    public MlServiceClient(WebClient.Builder webClientBuilder, 
                           @Value("${ml.service.url:http://localhost:8000}") String mlServiceUrl) {
        this.webClient = webClientBuilder.baseUrl(mlServiceUrl).build();
    }

    public DetectionResponse detectObjects(byte[] imageBytes, String filename) {
        // Prepare the multipart request
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        ByteArrayResource resource = new ByteArrayResource(imageBytes) {
            @Override
            public String getFilename() {
                return filename;
            }
        };
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_JPEG);
        HttpEntity<ByteArrayResource> fileEntity = new HttpEntity<>(resource, headers);
        
        body.add("file", fileEntity);

        return webClient.post()
                .uri("/api/detect")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(body))
                .retrieve()
                .bodyToMono(DetectionResponse.class)
                .block(); // Blocking for simplicity in this prototype
    }

    public java.util.Map<String, Object> analyzeVideo(byte[] videoBytes, String filename) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        ByteArrayResource resource = new ByteArrayResource(videoBytes) {
            @Override
            public String getFilename() {
                return filename;
            }
        };
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        HttpEntity<ByteArrayResource> fileEntity = new HttpEntity<>(resource, headers);
        
        body.add("file", fileEntity);

        return webClient.post()
                .uri("/api/analyze-video")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(body))
                .retrieve()
                .bodyToMono(new org.springframework.core.ParameterizedTypeReference<java.util.Map<String, Object>>() {})
                .block();
    }
}
