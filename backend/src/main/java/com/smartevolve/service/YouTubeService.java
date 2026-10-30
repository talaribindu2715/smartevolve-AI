package com.smartevolve.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartevolve.dto.UpdateVideoProgressRequest;
import com.smartevolve.dto.YouTubeSkillSummaryDto;
import com.smartevolve.dto.YouTubeVideoDto;
import com.smartevolve.entity.*;
import com.smartevolve.exception.ResourceNotFoundException;
import com.smartevolve.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class YouTubeService {

    private final YouTubeVideoRepository videoRepository;
    private final VideoProgressRepository progressRepository;
    private final SkillRepository skillRepository;
    private final ProfileRepository profileRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final SkillEvolutionHistoryRepository evolutionHistoryRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${youtube.api.key:}")
    private String youtubeApiKey;

    private static final String YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    /**
     * Get all active YouTube educational videos with the student's progress overlaid.
     */
    @Transactional(readOnly = true)
    public List<YouTubeVideoDto> getVideos(UUID studentId, UUID skillId, String difficulty, String query, Integer limit) {
        List<YouTubeVideo> videos;

        if (StringUtils.hasText(query)) {
            videos = videoRepository.searchVideos(query.trim());
        } else if (skillId != null) {
            videos = videoRepository.findBySkillIdAndActiveTrue(skillId);
        } else if (StringUtils.hasText(difficulty)) {
            videos = videoRepository.findByDifficultyIgnoreCaseAndActiveTrue(difficulty.trim());
        } else {
            videos = videoRepository.findByActiveTrue();
        }

        if (limit != null && limit > 0 && videos.size() > limit) {
            videos = videos.subList(0, limit);
        }

        Map<UUID, VideoProgress> progressMap = progressRepository.findByStudentId(studentId).stream()
                .collect(Collectors.toMap(p -> p.getVideo().getId(), p -> p, (a, b) -> a));

        return videos.stream()
                .map(v -> mapToDto(v, progressMap.get(v.getId())))
                .collect(Collectors.toList());
    }

    /**
     * Get detailed information for a single video by its UUID or YouTube 11-char videoId.
     */
    @Transactional(readOnly = true)
    public YouTubeVideoDto getVideoDetail(UUID studentId, String idOrVideoId) {
        YouTubeVideo video = findVideoByIdOrVideoId(idOrVideoId);
        Optional<VideoProgress> progress = progressRepository.findByStudentIdAndVideoId(studentId, video.getId());
        return mapToDto(video, progress.orElse(null));
    }

    /**
     * AI-Powered personalized video recommendations based on the student's current skill gaps.
     */
    @Transactional(readOnly = true)
    public List<YouTubeVideoDto> getRecommendedVideos(UUID studentId) {
        Profile student = profileRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

        // Retrieve student's current skills
        List<StudentSkill> currentSkills = studentSkillRepository.findByStudentIdOrderByProficiencyDesc(studentId);
        Set<UUID> masteredSkillIds = currentSkills.stream()
                .filter(s -> s.getProficiency().compareTo(BigDecimal.valueOf(80.0)) >= 0)
                .map(s -> s.getSkill().getId())
                .collect(Collectors.toSet());

        // Skills that need improvement (< 75 proficiency)
        List<UUID> growthSkillIds = currentSkills.stream()
                .filter(s -> s.getProficiency().compareTo(BigDecimal.valueOf(75.0)) < 0)
                .map(s -> s.getSkill().getId())
                .collect(Collectors.toList());

        List<YouTubeVideo> candidateVideos;
        if (!growthSkillIds.isEmpty()) {
            candidateVideos = videoRepository.findBySkillIds(growthSkillIds);
        } else {
            candidateVideos = videoRepository.findByActiveTrue();
        }

        // Overlay student watch progress
        Map<UUID, VideoProgress> progressMap = progressRepository.findByStudentId(studentId).stream()
                .collect(Collectors.toMap(p -> p.getVideo().getId(), p -> p, (a, b) -> a));

        // Prioritize videos that are NOT yet completed
        return candidateVideos.stream()
                .map(v -> {
                    YouTubeVideoDto dto = mapToDto(v, progressMap.get(v.getId()));
                    String skillName = v.getSkill() != null ? v.getSkill().getName() : "Key Skill";
                    dto.setRecommendationReason("Recommended to close active gap in " + skillName + " for your target career role.");
                    return dto;
                })
                .sorted((a, b) -> {
                    boolean aCompleted = "COMPLETED".equalsIgnoreCase(a.getWatchStatus());
                    boolean bCompleted = "COMPLETED".equalsIgnoreCase(b.getWatchStatus());
                    if (aCompleted != bCompleted) {
                        return aCompleted ? 1 : -1;
                    }
                    return b.getEstimatedMinutes().compareTo(a.getEstimatedMinutes());
                })
                .limit(8)
                .collect(Collectors.toList());
    }

    /**
     * Record video watch progress from the mobile player.
     * When completed, dynamically evolute student skill proficiency.
     */
    @Transactional
    public YouTubeVideoDto updateWatchProgress(UUID studentId, UpdateVideoProgressRequest request) {
        Profile student = profileRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

        YouTubeVideo video;
        if (request.getVideoId() != null) {
            video = videoRepository.findById(request.getVideoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Video not found: " + request.getVideoId()));
        } else if (StringUtils.hasText(request.getYoutubeVideoId())) {
            video = videoRepository.findByVideoId(request.getYoutubeVideoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Video not found with YouTube ID: " + request.getYoutubeVideoId()));
        } else {
            throw new IllegalArgumentException("Either videoId or youtubeVideoId must be provided");
        }

        VideoProgress progress = progressRepository.findByStudentIdAndVideoId(studentId, video.getId())
                .orElse(VideoProgress.builder()
                        .student(student)
                        .video(video)
                        .watchedSeconds(0)
                        .totalSeconds(request.getTotalSeconds() != null ? request.getTotalSeconds() : video.getEstimatedMinutes() * 60)
                        .completionPercentage(BigDecimal.ZERO)
                        .status("NOT_STARTED")
                        .build());

        int watched = request.getWatchedSeconds() != null ? Math.max(0, request.getWatchedSeconds()) : 0;
        int total = request.getTotalSeconds() != null && request.getTotalSeconds() > 0
                ? request.getTotalSeconds()
                : Math.max(1, video.getEstimatedMinutes() * 60);

        BigDecimal percentage = BigDecimal.valueOf(watched)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP)
                .min(BigDecimal.valueOf(100.00));

        String newStatus = request.getStatus();
        if (newStatus == null) {
            if (percentage.compareTo(BigDecimal.valueOf(90.0)) >= 0) {
                newStatus = "COMPLETED";
            } else if (watched > 10) {
                newStatus = "IN_PROGRESS";
            } else {
                newStatus = "NOT_STARTED";
            }
        }

        boolean wasAlreadyCompleted = "COMPLETED".equalsIgnoreCase(progress.getStatus());

        progress.setWatchedSeconds(watched);
        progress.setTotalSeconds(total);
        progress.setCompletionPercentage(percentage);
        progress.setStatus(newStatus);
        progress.setLastWatchedAt(OffsetDateTime.now());

        if ("COMPLETED".equalsIgnoreCase(newStatus)) {
            if (progress.getCompletedAt() == null) {
                progress.setCompletedAt(OffsetDateTime.now());
            }

            // Award skill proficiency evolution if newly completed
            if (!wasAlreadyCompleted) {
                awardProficiencyForVideoCompletion(student, video);
            }
        }

        VideoProgress saved = progressRepository.save(progress);
        log.info("Student {} video progress updated: video={}, status={}, pct={}%",
                studentId, video.getTitle(), newStatus, percentage);

        return mapToDto(video, saved);
    }

    /**
     * Get high-level summary of skills with available video lessons.
     */
    @Transactional(readOnly = true)
    public List<YouTubeSkillSummaryDto> getSkillSummaries() {
        List<YouTubeVideo> videos = videoRepository.findByActiveTrue();
        Map<Skill, Long> counts = videos.stream()
                .collect(Collectors.groupingBy(YouTubeVideo::getSkill, Collectors.counting()));

        return counts.entrySet().stream()
                .map(entry -> YouTubeSkillSummaryDto.builder()
                        .skillId(entry.getKey().getId())
                        .skillName(entry.getKey().getName())
                        .category(entry.getKey().getCategory())
                        .videoCount(entry.getValue())
                        .build())
                .sorted(Comparator.comparing(YouTubeSkillSummaryDto::getSkillName))
                .collect(Collectors.toList());
    }

    /**
     * Dynamic pipeline ingestion from YouTube Data API v3 if API key is provided.
     */
    @Transactional
    public List<YouTubeVideoDto> searchAndIngestFromYouTube(String keyword, UUID skillId) {
        if (!StringUtils.hasText(youtubeApiKey)) {
            log.info("YouTube API key not configured, returning existing curated videos for keyword '{}'", keyword);
            return getVideos(null, skillId, null, keyword, 10);
        }

        Skill skill = null;
        if (skillId != null) {
            skill = skillRepository.findById(skillId).orElse(null);
        }

        try {
            String query = keyword + " tutorial educational";
            String url = String.format("%s?part=snippet&maxResults=5&q=%s&type=video&videoEmbeddable=true&key=%s",
                    YOUTUBE_SEARCH_URL,
                    URLEncoder.encode(query, StandardCharsets.UTF_8),
                    youtubeApiKey);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(6))
                    .GET()
                    .build();

            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode items = root.path("items");

                List<YouTubeVideo> savedList = new ArrayList<>();
                for (JsonNode item : items) {
                    String videoId = item.path("id").path("videoId").asText();
                    if (!StringUtils.hasText(videoId) || videoRepository.findByVideoId(videoId).isPresent()) {
                        continue;
                    }

                    JsonNode snippet = item.path("snippet");
                    String title = snippet.path("title").asText("YouTube Video");
                    String desc = snippet.path("description").asText("");
                    String channel = snippet.path("channelTitle").asText("YouTube Channel");
                    String thumbnail = snippet.path("thumbnails").path("high").path("url")
                            .asText("https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg");

                    YouTubeVideo newVideo = YouTubeVideo.builder()
                            .videoId(videoId)
                            .title(title)
                            .description(desc)
                            .thumbnailUrl(thumbnail)
                            .channelTitle(channel)
                            .duration("20:00")
                            .estimatedMinutes(20)
                            .difficulty("BEGINNER")
                            .skill(skill != null ? skill : getDefaultSkill())
                            .category(skill != null ? skill.getCategory() : "Programming")
                            .viewCount("Educational")
                            .active(true)
                            .build();

                    savedList.add(videoRepository.save(newVideo));
                }

                log.info("Ingested {} new YouTube videos from API for query '{}'", savedList.size(), keyword);
            }
        } catch (Exception e) {
            log.warn("Failed to dynamically ingest YouTube videos: {}", e.getMessage());
        }

        return getVideos(null, skillId, null, keyword, 10);
    }

    private Skill getDefaultSkill() {
        return skillRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("No skills found in database"));
    }

    private YouTubeVideo findVideoByIdOrVideoId(String idOrVideoId) {
        try {
            UUID uuid = UUID.fromString(idOrVideoId);
            return videoRepository.findById(uuid)
                    .orElseGet(() -> videoRepository.findByVideoId(idOrVideoId)
                            .orElseThrow(() -> new ResourceNotFoundException("Video not found: " + idOrVideoId)));
        } catch (IllegalArgumentException e) {
            return videoRepository.findByVideoId(idOrVideoId)
                    .orElseThrow(() -> new ResourceNotFoundException("Video not found with YouTube ID: " + idOrVideoId));
        }
    }

    private void awardProficiencyForVideoCompletion(Profile student, YouTubeVideo video) {
        Skill skill = video.getSkill();
        if (skill == null) return;

        StudentSkill studentSkill = studentSkillRepository
                .findByStudentIdAndSkillId(student.getId(), skill.getId())
                .orElse(StudentSkill.builder()
                        .student(student)
                        .skill(skill)
                        .proficiency(BigDecimal.valueOf(20.0))
                        .confidence(BigDecimal.valueOf(0.40))
                        .evidenceType("VIDEO_COURSE_COMPLETED")
                        .build());

        BigDecimal prevProficiency = studentSkill.getProficiency();
        // Award incremental proficiency (+3.0%) capped at 95.0%
        BigDecimal delta = BigDecimal.valueOf(3.0);
        BigDecimal newProficiency = prevProficiency.add(delta).min(BigDecimal.valueOf(95.0));

        studentSkill.setProficiency(newProficiency);
        studentSkill.setConfidence(studentSkill.getConfidence().add(BigDecimal.valueOf(0.05)).min(BigDecimal.valueOf(0.95)));
        studentSkill.setEvidenceType("VIDEO_COURSE_COMPLETED");
        studentSkill.setLastAssessedAt(OffsetDateTime.now());
        studentSkillRepository.save(studentSkill);

        // Record Evolution History
        SkillEvolutionHistory history = SkillEvolutionHistory.builder()
                .student(student)
                .skill(skill)
                .previousProficiency(prevProficiency)
                .newProficiency(newProficiency)
                .changeReason(String.format("Completed YouTube video masterclass: '%s'", video.getTitle()))
                .evidenceType("VIDEO_LEARNING")
                .evidenceReference(video.getVideoId())
                .build();
        evolutionHistoryRepository.save(history);

        log.info("Student {} gained +{}% in {} from completing video '{}'",
                student.getId(), delta, skill.getName(), video.getTitle());
    }

    private YouTubeVideoDto mapToDto(YouTubeVideo v, VideoProgress prog) {
        String watchStatus = prog != null ? prog.getStatus() : "NOT_STARTED";
        BigDecimal pct = prog != null ? prog.getCompletionPercentage() : BigDecimal.ZERO;
        Integer watched = prog != null ? prog.getWatchedSeconds() : 0;
        Integer total = prog != null ? prog.getTotalSeconds() : v.getEstimatedMinutes() * 60;
        OffsetDateTime lastWatched = prog != null ? prog.getLastWatchedAt() : null;

        return YouTubeVideoDto.builder()
                .id(v.getId())
                .videoId(v.getVideoId())
                .title(v.getTitle())
                .description(v.getDescription())
                .thumbnailUrl(v.getThumbnailUrl())
                .channelTitle(v.getChannelTitle())
                .duration(v.getDuration())
                .estimatedMinutes(v.getEstimatedMinutes())
                .difficulty(v.getDifficulty())
                .skillId(v.getSkill() != null ? v.getSkill().getId() : null)
                .skillName(v.getSkill() != null ? v.getSkill().getName() : null)
                .category(v.getCategory())
                .viewCount(v.getViewCount())
                .videoUrl("https://www.youtube.com/watch?v=" + v.getVideoId())
                .embedUrl("https://www.youtube.com/embed/" + v.getVideoId())
                .watchStatus(watchStatus)
                .progressPercentage(pct)
                .watchedSeconds(watched)
                .totalSeconds(total)
                .lastWatchedAt(lastWatched)
                .build();
    }
}
