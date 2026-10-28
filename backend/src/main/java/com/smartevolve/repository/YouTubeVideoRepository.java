package com.smartevolve.repository;

import com.smartevolve.entity.YouTubeVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface YouTubeVideoRepository extends JpaRepository<YouTubeVideo, UUID> {

    List<YouTubeVideo> findByActiveTrue();

    List<YouTubeVideo> findBySkillIdAndActiveTrue(UUID skillId);

    List<YouTubeVideo> findBySkillNameIgnoreCaseAndActiveTrue(String skillName);

    Optional<YouTubeVideo> findByVideoId(String videoId);

    List<YouTubeVideo> findByDifficultyIgnoreCaseAndActiveTrue(String difficulty);

    @Query("SELECT v FROM YouTubeVideo v WHERE v.active = true AND " +
           "(LOWER(v.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(v.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(v.channelTitle) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(v.skill.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<YouTubeVideo> searchVideos(@Param("query") String query);

    @Query("SELECT v FROM YouTubeVideo v WHERE v.active = true AND v.skill.id IN :skillIds")
    List<YouTubeVideo> findBySkillIds(@Param("skillIds") List<UUID> skillIds);
}
