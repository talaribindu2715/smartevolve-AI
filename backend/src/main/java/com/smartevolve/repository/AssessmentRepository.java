package com.smartevolve.repository;

import com.smartevolve.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, UUID> {
    List<Assessment> findByActiveTrue();
    List<Assessment> findBySkillIdAndActiveTrue(UUID skillId);
}
