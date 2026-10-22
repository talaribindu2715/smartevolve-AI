package com.smartevolve.repository;

import com.smartevolve.entity.StudentSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentSkillRepository extends JpaRepository<StudentSkill, UUID> {
    List<StudentSkill> findByStudentId(UUID studentId);
    Optional<StudentSkill> findByStudentIdAndSkillId(UUID studentId, UUID skillId);

    @Query("SELECT ss FROM StudentSkill ss JOIN FETCH ss.skill WHERE ss.student.id = :studentId ORDER BY ss.proficiency DESC")
    List<StudentSkill> findByStudentIdOrderByProficiencyDesc(@Param("studentId") UUID studentId);
}
