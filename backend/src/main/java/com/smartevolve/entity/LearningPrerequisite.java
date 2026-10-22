package com.smartevolve.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "learning_prerequisites", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"resource_id", "prerequisite_resource_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningPrerequisite {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false)
    private LearningResource resource;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prerequisite_resource_id", nullable = false)
    private LearningResource prerequisiteResource;
}
