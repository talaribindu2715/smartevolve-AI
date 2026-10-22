package com.smartevolve.repository;

import com.smartevolve.entity.Career;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CareerRepository extends JpaRepository<Career, UUID> {
    List<Career> findByActiveTrue();
    Optional<Career> findByNameIgnoreCase(String name);
    List<Career> findByCategory(String category);
}
