package com.smartevolve.repository;

import com.smartevolve.entity.AssessmentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssessmentAttemptRepository extends JpaRepository<AssessmentAttempt, UUID> {
    List<AssessmentAttempt> findByStudentIdOrderBySubmittedAtDesc(UUID studentId);
    List<AssessmentAttempt> findByStudentIdAndAssessmentIdOrderByAttemptNumberDesc(UUID studentId, UUID assessmentId);
    long countByStudentIdAndAssessmentId(UUID studentId, UUID assessmentId);
}
