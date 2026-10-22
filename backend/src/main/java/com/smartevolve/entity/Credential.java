package com.smartevolve.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "credentials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Credential {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Profile student;

    @Column(name = "credential_type", nullable = false)
    private String credentialType; // SKILL_MASTERY, CAREER_READY, MILESTONE_HONOR

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id")
    private Skill skill;

    @Column(name = "achievement_title", nullable = false)
    private String achievementTitle;

    @Column(name = "achievement_data_hash", nullable = false)
    private String achievementDataHash;

    @Column(name = "issuer_address", nullable = false)
    private String issuerAddress;

    @Column(name = "network_id", nullable = false)
    @Builder.Default
    private String networkId = "hardhat-local";

    @Column(name = "contract_address", nullable = false)
    private String contractAddress;

    @Column(name = "transaction_hash", nullable = false)
    private String transactionHash;

    @Column(name = "block_number")
    private Long blockNumber;

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "PENDING"; // PENDING, CONFIRMED, FAILED, REVOKED

    @CreationTimestamp
    @Column(name = "issued_at", updatable = false)
    private OffsetDateTime issuedAt;

    @Column(name = "verified_at")
    private OffsetDateTime verifiedAt;
}
