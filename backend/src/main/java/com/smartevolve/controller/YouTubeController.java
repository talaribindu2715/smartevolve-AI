package com.smartevolve.controller;

import com.smartevolve.dto.UpdateVideoProgressRequest;
import com.smartevolve.dto.YouTubeSkillSummaryDto;
import com.smartevolve.dto.YouTubeVideoDto;
import com.smartevolve.security.SecurityUtils;
import com.smartevolve.service.YouTubeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/youtube")
@RequiredArgsConstructor
@Tag(name = "YouTube Learning Pipeline", description = "Endpoints for streaming, recommending, and tracking educational YouTube videos")
public class YouTubeController {

    private final YouTubeService youTubeService;

    @GetMapping("/videos")
    @Operation(summary = "Get YouTube educational videos filtered by skill, difficulty, search query, or limit")
    public ResponseEntity<List<YouTubeVideoDto>> getVideos(
            @RequestParam(required = false) UUID skillId,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Integer limit) {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(youTubeService.getVideos(studentId, skillId, difficulty, query, limit));
    }

    @GetMapping("/videos/{idOrVideoId}")
    @Operation(summary = "Get full YouTube video details and student watch progress by internal UUID or YouTube 11-char ID")
    public ResponseEntity<YouTubeVideoDto> getVideoDetail(@PathVariable String idOrVideoId) {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(youTubeService.getVideoDetail(studentId, idOrVideoId));
    }

    @GetMapping("/recommended")
    @Operation(summary = "Get AI-recommended YouTube video tutorials targeted to the student's current skill gaps")
    public ResponseEntity<List<YouTubeVideoDto>> getRecommendedVideos() {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(youTubeService.getRecommendedVideos(studentId));
    }

    @GetMapping("/skills")
    @Operation(summary = "Get skills summary with available video tutorials count")
    public ResponseEntity<List<YouTubeSkillSummaryDto>> getSkillSummaries() {
        return ResponseEntity.ok(youTubeService.getSkillSummaries());
    }

    @PostMapping("/progress")
    @Operation(summary = "Update video playback progress and award student skill proficiency upon completion")
    public ResponseEntity<YouTubeVideoDto> updateProgress(@Valid @RequestBody UpdateVideoProgressRequest request) {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(youTubeService.updateWatchProgress(studentId, request));
    }

    @PostMapping("/ingest")
    @Operation(summary = "Ingest new YouTube video tutorials for a topic using YouTube Data API v3 (or fallback to curated)")
    public ResponseEntity<List<YouTubeVideoDto>> ingestVideos(
            @RequestParam String query,
            @RequestParam(required = false) UUID skillId) {
        return ResponseEntity.ok(youTubeService.searchAndIngestFromYouTube(query, skillId));
    }
}
