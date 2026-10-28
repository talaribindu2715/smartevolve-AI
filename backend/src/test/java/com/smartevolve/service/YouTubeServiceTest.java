package com.smartevolve.service;

import com.smartevolve.dto.UpdateVideoProgressRequest;
import com.smartevolve.dto.YouTubeVideoDto;
import com.smartevolve.entity.*;
import com.smartevolve.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class YouTubeServiceTest {

    @Mock
    private YouTubeVideoRepository videoRepository;

    @Mock
    private VideoProgressRepository progressRepository;

    @Mock
    private SkillRepository skillRepository;

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private StudentSkillRepository studentSkillRepository;

    @Mock
    private SkillEvolutionHistoryRepository evolutionHistoryRepository;

    @InjectMocks
    private YouTubeService youTubeService;

    private UUID studentId;
    private Profile mockProfile;
    private Skill mockSkill;
    private YouTubeVideo mockVideo;

    @BeforeEach
    void setUp() {
        studentId = UUID.randomUUID();
        mockProfile = Profile.builder()
                .id(studentId)
                .fullName("Alex Chen")
                .build();

        mockSkill = Skill.builder()
                .id(UUID.randomUUID())
                .name("Python")
                .category("Programming")
                .build();

        mockVideo = YouTubeVideo.builder()
                .id(UUID.randomUUID())
                .videoId("rfscVS0vtbw")
                .title("Python Full Course")
                .description("Comprehensive Python tutorial")
                .skill(mockSkill)
                .thumbnailUrl("https://img.youtube.com/vi/rfscVS0vtbw/hqdefault.jpg")
                .channelTitle("freeCodeCamp.org")
                .duration("4:26:52")
                .estimatedMinutes(266)
                .difficulty("BEGINNER")
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Should return active YouTube videos with student progress overlay")
    void testGetVideosWithProgress() {
        when(videoRepository.findByActiveTrue()).thenReturn(List.of(mockVideo));
        when(progressRepository.findByStudentId(studentId)).thenReturn(Collections.emptyList());

        List<YouTubeVideoDto> videos = youTubeService.getVideos(studentId, null, null, null, null);

        assertNotNull(videos);
        assertEquals(1, videos.size());
        assertEquals("rfscVS0vtbw", videos.get(0).getVideoId());
        assertEquals("NOT_STARTED", videos.get(0).getWatchStatus());
        assertEquals("https://www.youtube.com/embed/rfscVS0vtbw", videos.get(0).getEmbedUrl());
    }

    @Test
    @DisplayName("Should record video watch progress and award proficiency on completion")
    void testUpdateWatchProgressCompletion() {
        when(profileRepository.findById(studentId)).thenReturn(Optional.of(mockProfile));
        when(videoRepository.findById(mockVideo.getId())).thenReturn(Optional.of(mockVideo));
        when(progressRepository.findByStudentIdAndVideoId(studentId, mockVideo.getId())).thenReturn(Optional.empty());
        when(progressRepository.save(any(VideoProgress.class))).thenAnswer(invocation -> invocation.getArgument(0));

        StudentSkill studentSkill = StudentSkill.builder()
                .student(mockProfile)
                .skill(mockSkill)
                .proficiency(BigDecimal.valueOf(50.0))
                .confidence(BigDecimal.valueOf(0.5))
                .build();
        when(studentSkillRepository.findByStudentIdAndSkillId(studentId, mockSkill.getId())).thenReturn(Optional.of(studentSkill));

        UpdateVideoProgressRequest request = UpdateVideoProgressRequest.builder()
                .videoId(mockVideo.getId())
                .watchedSeconds(1500)
                .totalSeconds(1500)
                .status("COMPLETED")
                .build();

        YouTubeVideoDto result = youTubeService.updateWatchProgress(studentId, request);

        assertNotNull(result);
        assertEquals("COMPLETED", result.getWatchStatus());
        assertEquals(BigDecimal.valueOf(100.00).setScale(2), result.getProgressPercentage());

        // Verify proficiency increased (+3.0%)
        verify(studentSkillRepository).save(argThat(s -> s.getProficiency().compareTo(BigDecimal.valueOf(53.0)) == 0));
        // Verify evolution history logged
        verify(evolutionHistoryRepository).save(any(SkillEvolutionHistory.class));
    }
}
