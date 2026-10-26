package com.smartevolve.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@Tag(name = "Public", description = "Public health and status endpoints for container health checks")
public class PublicHealthController {

    @GetMapping("/health")
    @Operation(summary = "Lightweight health check endpoint for Render deployment")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "smartevolve-backend",
            "timestamp", Instant.now().toString()
        ));
    }
}
