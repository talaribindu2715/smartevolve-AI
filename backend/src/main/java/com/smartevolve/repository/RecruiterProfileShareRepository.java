package com.smartevolve.repository;

import com.smartevolve.entity.RecruiterProfileShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecruiterProfileShareRepository extends JpaRepository<RecruiterProfileShare, UUID> {

    List<RecruiterProfileShare> findByRecruiterIdAndStatus(UUID recruiterId, String status);

    List<RecruiterProfileShare> findByRecruiterId(UUID recruiterId);

    List<RecruiterProfileShare> findByStudentId(UUID studentId);

    Optional<RecruiterProfileShare> findByRecruiterIdAndStudentId(UUID recruiterId, UUID studentId);

    boolean existsByRecruiterIdAndStudentIdAndStatus(UUID recruiterId, UUID studentId, String status);

    @Query("SELECT COUNT(r) FROM RecruiterProfileShare r WHERE r.recruiter.id = :recruiterId AND r.status = 'ACTIVE'")
    long countActiveCandidatesForRecruiter(@Param("recruiterId") UUID recruiterId);
}
