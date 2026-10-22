package com.smartevolve.service;

import com.smartevolve.blockchain.BlockchainService;
import com.smartevolve.dto.CredentialDto;
import com.smartevolve.dto.VerifyCredentialResponse;
import com.smartevolve.entity.Credential;
import com.smartevolve.entity.Profile;
import com.smartevolve.entity.Skill;
import com.smartevolve.exception.ResourceNotFoundException;
import com.smartevolve.repository.CredentialRepository;
import com.smartevolve.repository.ProfileRepository;
import com.smartevolve.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CredentialService {

    private final CredentialRepository credentialRepository;
    private final ProfileRepository profileRepository;
    private final SkillRepository skillRepository;
    private final BlockchainService blockchainService;

    @Transactional(readOnly = true)
    public List<CredentialDto> getStudentCredentials(UUID studentId) {
        return credentialRepository.findByStudentIdOrderByIssuedAtDesc(studentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
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

        // 3. Persist credential metadata in Supabase PostgreSQL
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
                .transactionHash(txResult.getTransactionHash())
                .blockNumber(txResult.getBlockNumber())
                .status("CONFIRMED")
                .verifiedAt(OffsetDateTime.now())
                .build();

        Credential saved = credentialRepository.save(credential);
        log.info("Issued blockchain-backed credential {} (tx: {}) for student {}",
                credentialId, txResult.getTransactionHash(), studentId);

        return mapToDto(saved);
    }

    @Transactional
    public VerifyCredentialResponse verifyCredentialOnChain(UUID studentId, UUID credentialId) {
        Credential credential = credentialRepository.findById(credentialId)
                .orElseThrow(() -> new ResourceNotFoundException("Credential not found: " + credentialId));

        // Call smart contract verification on Ethereum / EVM network
        var verifResult = blockchainService.verifyCredential(
                credential.getId().toString(),
                credential.getAchievementDataHash()
        );

        if (verifResult.isValid()) {
            credential.setStatus("CONFIRMED");
            credential.setVerifiedAt(OffsetDateTime.now());
        } else if (verifResult.isRevoked()) {
            credential.setStatus("REVOKED");
        } else {
            credential.setStatus("FAILED");
        }
        credentialRepository.save(credential);

        return VerifyCredentialResponse.builder()
                .credentialId(credential.getId())
                .achievementTitle(credential.getAchievementTitle())
                .valid(verifResult.isValid())
                .status(verifResult.getStatus())
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
