package com.smartevolve.repository;

import com.smartevolve.entity.LearningPrerequisite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LearningPrerequisiteRepository extends JpaRepository<LearningPrerequisite, UUID> {
    List<LearningPrerequisite> findByResourceId(UUID resourceId);
    List<LearningPrerequisite> findByPrerequisiteResourceId(UUID prerequisiteResourceId);
}
