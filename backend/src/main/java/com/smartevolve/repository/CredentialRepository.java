package com.smartevolve.repository;

import com.smartevolve.entity.Credential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CredentialRepository extends JpaRepository<Credential, UUID> {
    List<Credential> findByStudentIdOrderByIssuedAtDesc(UUID studentId);
    Optional<Credential> findByAchievementDataHash(String achievementDataHash);
    Optional<Credential> findByTransactionHash(String transactionHash);
}
