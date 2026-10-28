package com.smartevolve.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateVideoProgressRequest {

    // Can accept either UUID id or 11-char YouTube video ID
    private UUID videoId;

    private String youtubeVideoId;

    @NotNull(message = "Watched seconds is required")
    private Integer watchedSeconds;

    private Integer totalSeconds;

    private String status; // IN_PROGRESS, COMPLETED
}
