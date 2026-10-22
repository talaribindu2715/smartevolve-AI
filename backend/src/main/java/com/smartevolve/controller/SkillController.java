package com.smartevolve.controller;

import com.smartevolve.dto.SaveStudentSkillRequest;
import com.smartevolve.dto.SkillDto;
import com.smartevolve.dto.StudentSkillDto;
import com.smartevolve.security.SecurityUtils;
import com.smartevolve.service.SkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
@Tag(name = "Skills", description = "Skill Catalog and Student Proficiency")
public class SkillController {

    private final SkillService skillService;

    @GetMapping
    @Operation(summary = "Get all available catalog skills across all categories")
    public ResponseEntity<List<SkillDto>> getAllSkills() {
        return ResponseEntity.ok(skillService.getAllSkills());
    }

    @GetMapping("/my")
    @Operation(summary = "Get authenticated student's current skill proficiencies")
    public ResponseEntity<List<StudentSkillDto>> getMySkills() {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(skillService.getStudentSkills(studentId));
    }

    @PostMapping("/self-report")
    @Operation(summary = "Save or update a student skill proficiency (self-reported or baseline)")
    public ResponseEntity<StudentSkillDto> saveSkill(@Valid @RequestBody SaveStudentSkillRequest request) {
        UUID studentId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(skillService.saveStudentSkill(studentId, request));
    }
}
