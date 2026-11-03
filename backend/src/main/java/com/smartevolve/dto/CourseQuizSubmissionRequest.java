package com.smartevolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseQuizSubmissionRequest {
    private String courseOrVideoId;
    private String courseTitle;
    private String skillName;
    private Integer score;
    private Integer totalQuestions;
    private Integer timeTakenSeconds;
    private Integer attemptNumber;
    private String difficulty; // BEGINNER, INTERMEDIATE, ADVANCED
    private String platform;   // SMARTEVOLVE, WAYGROUND, KAHOOT, QUIZIZZ
}
