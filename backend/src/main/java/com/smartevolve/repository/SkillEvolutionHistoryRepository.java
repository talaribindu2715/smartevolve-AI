package com.smartevolve.repository;

import com.smartevolve.entity.SkillEvolutionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SkillEvolutionHistoryRepository extends JpaRepository<SkillEvolutionHistory, UUID> {
    List<SkillEvolutionHistory> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
    List<SkillEvolutionHistory> findByStudentIdAndSkillIdOrderByCreatedAtDesc(UUID studentId, UUID skillId);
}
