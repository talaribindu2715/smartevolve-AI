package com.smartevolve.service;

import com.smartevolve.blockchain.BlockchainService;
import com.smartevolve.dto.ClaimCredentialRequest;
import com.smartevolve.dto.CredentialDto;
import com.smartevolve.dto.EligibleCredentialDto;
import com.smartevolve.dto.VerifyCredentialResponse;
import com.smartevolve.entity.*;
import com.smartevolve.exception.BadRequestException;
import com.smartevolve.exception.ResourceNotFoundException;
import com.smartevolve.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CredentialService {

    private final CredentialRepository credentialRepository;
    private final ProfileRepository profileRepository;
    private final SkillRepository skillRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final AssessmentAttemptRepository attemptRepository;
    private final BlockchainService blockchainService;

    @Transactional(readOnly = true)
    public List<CredentialDto> getStudentCredentials(UUID studentId) {
        return credentialRepository.findByStudentIdOrderByIssuedAtDesc(studentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EligibleCredentialDto> getEligibleCredentials(UUID studentId) {
        List<Credential> existingCreds = credentialRepository.findByStudentIdOrderByIssuedAtDesc(studentId);
        Set<UUID> claimedSkillIds = existingCreds.stream()
                .filter(c -> c.getSkill() != null)
                .map(c -> c.getSkill().getId())
                .collect(Collectors.toSet());

        List<EligibleCredentialDto> eligibleList = new ArrayList<>();

        // Check verified student skills with high proficiency (>= 75%)
        List<StudentSkill> studentSkills = studentSkillRepository.findByStudentId(studentId);
        for (StudentSkill ss : studentSkills) {
            if (ss.getProficiency().compareTo(new BigDecimal("75.0")) >= 0 && !claimedSkillIds.contains(ss.getSkill().getId())) {
                eligibleList.add(EligibleCredentialDto.builder()
                        .skillId(ss.getSkill().getId())
                        .skillName(ss.getSkill().getName())
                        .achievementTitle(ss.getSkill().getName() + " Verified Proficiency Mastery")
                        .milestoneType("DEMONSTRATED_MASTERY")
                        .scoreOrProficiency(ss.getProficiency())
                        .criteriaDescription(String.format("Demonstrated %.1f%% calibrated proficiency via rigorous assessment evidence.", ss.getProficiency().doubleValue()))
                        .eligible(true)
                        .build());
            }
        }

        // Check high-scoring assessment attempts (score >= 80%)
        List<AssessmentAttempt> attempts = attemptRepository.findByStudentIdOrderBySubmittedAtDesc(studentId);
        for (AssessmentAttempt attempt : attempts) {
            if (attempt.getPercentage().compareTo(new BigDecimal("80.0")) >= 0) {
                Skill skill = attempt.getAssessment().getSkill();
                if (skill != null && !claimedSkillIds.contains(skill.getId())) {
                    boolean alreadyInList = eligibleList.stream().anyMatch(e -> e.getSkillId().equals(skill.getId()));
                    if (!alreadyInList) {
                        eligibleList.add(EligibleCredentialDto.builder()
                                .skillId(skill.getId())
                                .skillName(skill.getName())
                                .achievementTitle(skill.getName() + " Academic Diagnostic Honors")
                                .milestoneType("ASSESSMENT_EXCELLENCE")
                                .scoreOrProficiency(attempt.getPercentage())
                                .criteriaDescription(String.format("Scored %.1f%% on %s diagnostic exam.", attempt.getPercentage().doubleValue(), attempt.getAssessment().getTitle()))
                                .eligible(true)
                                .build());
                    }
                }
            }
        }

        return eligibleList;
    }

    @Transactional
    public CredentialDto claimCredential(UUID studentId, ClaimCredentialRequest request) {
        UUID skillId = request.getSkillId();
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + skillId));

        // Prevent duplicate claims for the same skill
        List<Credential> existing = credentialRepository.findByStudentIdOrderByIssuedAtDesc(studentId);
        boolean alreadyClaimed = existing.stream().anyMatch(c -> c.getSkill() != null && c.getSkill().getId().equals(skillId));
        if (alreadyClaimed) {
            throw new BadRequestException("Credential already claimed and anchored for skill: " + skill.getName());
        }

        String title = request.getAchievementTitle() != null && !request.getAchievementTitle().isBlank()
                ? request.getAchievementTitle()
                : skill.getName() + " Verified Proficiency Mastery";

        return issueMilestoneCredential(studentId, skillId, title);
    }

    @Transactional
    public CredentialDto issueMilestoneCredential(UUID studentId, UUID skillId, String achievementTitle) {
        Profile profile = profileRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

        Skill skill = skillId != null ? skillRepository.findById(skillId).orElse(null) : null;

        UUID credentialId = UUID.randomUUID();

        // 1. Generate tamper-evident cryptographic hash of achievement
        String achievementHash = blockchainService.generateAchievementHash(
                studentId, achievementTitle, "Score >= 80% Mastery Evidence");

        // 2. Submit transaction to EVM smart contract
        var txResult = blockchainService.issueCredential(
                credentialId,
                studentId,
                achievementTitle,
                achievementHash
        );

        // 3. Persist credential record with authentic transaction verification status
        String status = txResult.isConfirmed() && txResult.getTransactionHash() != null
                ? "CONFIRMED"
                : "OFFCHAIN_VERIFIED";

        String txHash = txResult.getTransactionHash() != null
                ? txResult.getTransactionHash()
                : "PENDING_ONCHAIN_SYNC (Local Standby)";

        Credential credential = Credential.builder()
                .id(credentialId)
                .student(profile)
                .skill(skill)
                .credentialType("SKILL_MASTERY")
                .achievementTitle(achievementTitle)
                .achievementDataHash(achievementHash)
                .issuerAddress(txResult.getIssuerAddress())
                .networkId(txResult.getNetworkName())
                .contractAddress(txResult.getContractAddress())
                .transactionHash(txHash)
                .blockNumber(txResult.getBlockNumber() != null ? txResult.getBlockNumber() : 1L)
                .status(status)
                .verifiedAt(OffsetDateTime.now())
                .build();

        Credential saved = credentialRepository.save(credential);
        log.info("Issued credential {} (status: {}, tx: {}) for student {}",
                credentialId, status, txHash, studentId);

        return mapToDto(saved);
    }

    @Transactional
    public VerifyCredentialResponse verifyCredentialOnChain(UUID studentId, UUID credentialId) {
        Credential credential = credentialRepository.findById(credentialId)
                .orElseThrow(() -> new ResourceNotFoundException("Credential not found: " + credentialId));

        return performVerification(credential);
    }

    @Transactional
    public VerifyCredentialResponse getPublicVerification(UUID credentialId) {
        Credential credential = credentialRepository.findById(credentialId)
                .orElseThrow(() -> new ResourceNotFoundException("Credential not found: " + credentialId));

        return performVerification(credential);
    }

    private VerifyCredentialResponse performVerification(Credential credential) {
        var verifResult = blockchainService.verifyCredential(
                credential.getId().toString(),
                credential.getAchievementDataHash()
        );

        if (verifResult.isValid() && "CONFIRMED".equals(verifResult.getStatus())) {
            credential.setStatus("CONFIRMED");
            credential.setVerifiedAt(OffsetDateTime.now());
        } else if (verifResult.isRevoked()) {
            credential.setStatus("REVOKED");
        } else if (verifResult.isValid()) {
            credential.setStatus("OFFCHAIN_VERIFIED");
            credential.setVerifiedAt(OffsetDateTime.now());
        } else {
            credential.setStatus("FAILED");
        }
        credentialRepository.save(credential);

        return VerifyCredentialResponse.builder()
                .credentialId(credential.getId())
                .achievementTitle(credential.getAchievementTitle())
                .valid(verifResult.isValid())
                .status(credential.getStatus())
                .transactionHash(credential.getTransactionHash())
                .contractAddress(credential.getContractAddress())
                .issuerAddress(verifResult.getIssuerAddress())
                .onChainTimestamp(verifResult.getTimestamp())
                .verificationMessage(verifResult.getMessage())
                .build();
    }

    private CredentialDto mapToDto(Credential c) {
        return CredentialDto.builder()
                .id(c.getId())
                .credentialType(c.getCredentialType())
                .skillId(c.getSkill() != null ? c.getSkill().getId() : null)
                .skillName(c.getSkill() != null ? c.getSkill().getName() : null)
                .achievementTitle(c.getAchievementTitle())
                .achievementDataHash(c.getAchievementDataHash())
                .issuerAddress(c.getIssuerAddress())
                .networkId(c.getNetworkId())
                .contractAddress(c.getContractAddress())
                .transactionHash(c.getTransactionHash())
                .blockNumber(c.getBlockNumber())
                .status(c.getStatus())
                .issuedAt(c.getIssuedAt())
                .verifiedAt(c.getVerifiedAt())
                .build();
    }
}
