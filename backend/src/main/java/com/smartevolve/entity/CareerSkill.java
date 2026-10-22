package com.smartevolve.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "career_skills", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"career_id", "skill_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareerSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "career_id", nullable = false)
    private Career career;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Column(name = "required_proficiency", nullable = false, precision = 5, scale = 2)
    private BigDecimal requiredProficiency;

    @Column(name = "importance_weight", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal importanceWeight = BigDecimal.ONE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prerequisite_skill_id")
    private Skill prerequisiteSkill;
}
