package com.smartevolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyAssistantResponse {
    private String answer;
    private List<String> keyConcepts;
    private List<String> recommendedTopics;
    private PracticeQuestion practiceQuestion;
    private List<String> sourcesOrReferences;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PracticeQuestion {
        private String questionText;
        private List<String> options;
        private int correctOptionIndex;
        private String explanation;
    }
}
