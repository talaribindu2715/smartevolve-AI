package com.smartevolve.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank
    private String fullName;
    @NotBlank
    private String email;
    @NotBlank
    private String password;
    private String educationLevel;
    private String institution;
    private String branch;
    private Integer graduationYear;
    private String interests;
}
