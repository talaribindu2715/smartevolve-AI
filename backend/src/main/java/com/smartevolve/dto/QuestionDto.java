package com.smartevolve.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDto {
    private UUID id;
    private String questionText;
    private String questionType;
    private String options; // JSON string format [{"id":"A","text":"..."}, ...]
    private Integer marks;
    private Integer orderIndex;
}
