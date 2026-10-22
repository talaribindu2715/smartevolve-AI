package com.smartevolve.repository;

import com.smartevolve.entity.LearningProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LearningProgressRepository extends JpaRepository<LearningProgress, UUID> {
    List<LearningProgress> findByStudentId(UUID studentId);
    Optional<LearningProgress> findByStudentIdAndResourceId(UUID studentId, UUID resourceId);
    long countByStudentIdAndStatus(UUID studentId, String status);
}
