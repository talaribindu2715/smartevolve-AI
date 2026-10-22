package com.smartevolve.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "student_skills", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "skill_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentSkill {

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

    @Column(name = "proficiency", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal proficiency = BigDecimal.ZERO;

    @Column(name = "confidence", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal confidence = new BigDecimal("0.40");

    @Column(name = "evidence_type", nullable = false)
    @Builder.Default
    private String evidenceType = "SELF_REPORTED"; // SELF_REPORTED, ASSESSMENT, PROJECT, VERIFIED_CREDENTIAL

    @Column(name = "last_assessed_at")
    private OffsetDateTime lastAssessedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
