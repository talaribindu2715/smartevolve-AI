package com.smartevolve.repository;

import com.smartevolve.entity.VideoProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VideoProgressRepository extends JpaRepository<VideoProgress, UUID> {

    List<VideoProgress> findByStudentId(UUID studentId);

    Optional<VideoProgress> findByStudentIdAndVideoId(UUID studentId, UUID videoId);

    @Query("SELECT vp FROM VideoProgress vp WHERE vp.student.id = :studentId AND vp.video.videoId = :youtubeVideoId")
    Optional<VideoProgress> findByStudentIdAndYouTubeVideoId(@Param("studentId") UUID studentId, @Param("youtubeVideoId") String youtubeVideoId);

    long countByStudentIdAndStatus(UUID studentId, String status);
}
