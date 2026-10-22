package com.smartevolve.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "skill_evolution_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillEvolutionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Profile student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "previous_proficiency", nullable = false, precision = 5, scale = 2)
    private BigDecimal previousProficiency;

    @Column(name = "new_proficiency", nullable = false, precision = 5, scale = 2)
    private BigDecimal newProficiency;

    @Column(name = "change_reason", nullable = false, columnDefinition = "TEXT")
    private String changeReason;

    @Column(name = "evidence_type", nullable = false)
    private String evidenceType; // ASSESSMENT, LESSON_COMPLETION, PROJECT, DIAGNOSTIC, SELF_ASSESSMENT

    @Column(name = "evidence_reference")
    private String evidenceReference;

    @Column(name = "profile_version", nullable = false)
    @Builder.Default
    private Integer profileVersion = 1;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
