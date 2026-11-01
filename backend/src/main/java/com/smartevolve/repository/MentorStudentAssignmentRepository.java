package com.smartevolve.repository;

import com.smartevolve.entity.MentorStudentAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MentorStudentAssignmentRepository extends JpaRepository<MentorStudentAssignment, UUID> {

    List<MentorStudentAssignment> findByMentorIdAndStatus(UUID mentorId, String status);

    List<MentorStudentAssignment> findByMentorId(UUID mentorId);

    List<MentorStudentAssignment> findByStudentId(UUID studentId);

    Optional<MentorStudentAssignment> findByMentorIdAndStudentId(UUID mentorId, UUID studentId);

    boolean existsByMentorIdAndStudentIdAndStatus(UUID mentorId, UUID studentId, String status);

    @Query("SELECT COUNT(m) FROM MentorStudentAssignment m WHERE m.mentor.id = :mentorId AND m.status = 'ACTIVE'")
    long countActiveStudentsForMentor(@Param("mentorId") UUID mentorId);
}
