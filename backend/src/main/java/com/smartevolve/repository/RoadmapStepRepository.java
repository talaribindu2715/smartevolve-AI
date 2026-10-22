package com.smartevolve.repository;

import com.smartevolve.entity.RoadmapStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoadmapStepRepository extends JpaRepository<RoadmapStep, UUID> {
    List<RoadmapStep> findByRoadmapIdOrderBySequenceNumberAsc(UUID roadmapId);
    Optional<RoadmapStep> findByRoadmapIdAndResourceId(UUID roadmapId, UUID resourceId);
}
