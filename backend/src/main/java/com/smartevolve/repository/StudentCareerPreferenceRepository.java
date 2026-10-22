package com.smartevolve.repository;

import com.smartevolve.entity.StudentCareerPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentCareerPreferenceRepository extends JpaRepository<StudentCareerPreference, UUID> {
    List<StudentCareerPreference> findByStudentIdOrderByPreferenceRankAsc(UUID studentId);
    Optional<StudentCareerPreference> findFirstByStudentIdOrderByPreferenceRankAsc(UUID studentId);
    Optional<StudentCareerPreference> findByStudentIdAndCareerId(UUID studentId, UUID careerId);
}
