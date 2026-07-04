package com.shoppablestream.backend.services;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class TwelveLabsService {

    private final String API_KEY = "tlk_0YX5P4818FTGTZ2GFKR0M03X3JA6";
    private final String API_URL = "https://api.twelvelabs.io/v1.3";
    private final RestTemplate restTemplate;

    public TwelveLabsService() {
        this.restTemplate = new RestTemplate();
    }

    public Map<String, Object> searchVideo(String indexId, String query) {
        String url = API_URL + "/search";
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-api-key", API_KEY);
        headers.set("Content-Type", "application/json");

        Map<String, Object> body = new HashMap<>();
        body.put("index_id", indexId);
        body.put("query", query);
        body.put("search_options", new String[]{"visual"});

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, Map.class);
            return response.getBody();
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return error;
        }
    }

    public Map<String, Object> analyzeVideo(String videoId, String prompt) {
        String url = API_URL + "/generate";
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-api-key", API_KEY);
        headers.set("Content-Type", "application/json");

        Map<String, Object> body = new HashMap<>();
        body.put("video_id", videoId);
        body.put("prompt", prompt);
        body.put("stream", false);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, Map.class);
            return response.getBody();
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return error;
        }
    }
}
