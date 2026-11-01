package com.smartevolve.repository;

import com.smartevolve.entity.LearningResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LearningResourceRepository extends JpaRepository<LearningResource, UUID> {
    List<LearningResource> findByActiveTrue();
    List<LearningResource> findBySkillIdAndActiveTrue(UUID skillId);

    @Query("SELECT lr FROM LearningResource lr WHERE lr.skill.id IN :skillIds AND lr.active = true")
    List<LearningResource> findBySkillIdInAndActiveTrue(@Param("skillIds") List<UUID> skillIds);
}
