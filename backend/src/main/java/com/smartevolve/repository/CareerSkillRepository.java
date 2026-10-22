package com.smartevolve.repository;

import com.smartevolve.entity.CareerSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CareerSkillRepository extends JpaRepository<CareerSkill, UUID> {
    @Query("SELECT cs FROM CareerSkill cs JOIN FETCH cs.skill WHERE cs.career.id = :careerId ORDER BY cs.importanceWeight DESC")
    List<CareerSkill> findByCareerIdWithSkill(@Param("careerId") UUID careerId);

    List<CareerSkill> findByCareerId(UUID careerId);
}
