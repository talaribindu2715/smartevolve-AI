package com.smartevolve.repository;

import com.smartevolve.entity.LearningRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LearningRoadmapRepository extends JpaRepository<LearningRoadmap, UUID> {
    Optional<LearningRoadmap> findFirstByStudentIdAndStatusOrderByVersionDesc(UUID studentId, String status);
    Optional<LearningRoadmap> findFirstByStudentIdAndCareerIdAndStatusOrderByVersionDesc(UUID studentId, UUID careerId, String status);
    List<LearningRoadmap> findByStudentIdOrderByGeneratedAtDesc(UUID studentId);
}
