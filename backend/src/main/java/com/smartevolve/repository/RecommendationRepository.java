package com.smartevolve.repository;

import com.smartevolve.entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, UUID> {
    List<Recommendation> findByStudentIdAndStatusOrderByCreatedAtDesc(UUID studentId, String status);
    List<Recommendation> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
}
