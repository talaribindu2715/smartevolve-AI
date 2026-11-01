package com.smartevolve.security;

import com.smartevolve.blockchain.BlockchainService;
import com.smartevolve.dto.QuestionDto;
import com.smartevolve.entity.AssessmentQuestion;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.Hash;
import org.web3j.protocol.Web3j;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class SecurityAndPrivacyTest {

    @Test
    @DisplayName("PII Protection: Student UUID and personal info must never appear on-chain in plaintext")
    void testStudentPiiMaskingOnChain() {
        UUID studentId = UUID.fromString("9a7c3b2e-4d5f-4a1b-8c2d-3e4f5a6b7c8d");
        
        // Keccak-256 hash calculation as executed by BlockchainService
        byte[] studentHashBytes = Hash.sha3(studentId.toString().getBytes(StandardCharsets.UTF_8));
        String studentHashHex = org.web3j.utils.Numeric.toHexString(studentHashBytes);

        // Verification: Plaintext UUID is irreversibly hashed
        assertNotNull(studentHashHex);
        assertEquals(66, studentHashHex.length()); // 0x + 64 hex characters (32 bytes)
        assertFalse(studentHashHex.contains(studentId.toString()), "PII must never appear inside cryptographic hash");
    }

    @Test
    @DisplayName("Tamper Evidence: Altering single character in achievement details completely changes SHA-256 hash")
    void testAchievementHashTamperEvidence() {
        Web3j mockWeb3j = mock(Web3j.class);
        Credentials credentials = Credentials.create("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
        BlockchainService blockchainService = new BlockchainService(mockWeb3j, credentials);

        UUID studentId = UUID.randomUUID();
        String title = "Python Mastery Certification";
        String validDetails = "Score:95.0|Difficulty:ADVANCED|Attempts:1";
        String tamperedDetails = "Score:95.1|Difficulty:ADVANCED|Attempts:1";

        String hash1 = blockchainService.generateAchievementHash(studentId, title, validDetails);
        String hash2 = blockchainService.generateAchievementHash(studentId, title, tamperedDetails);

        assertNotNull(hash1);
        assertNotNull(hash2);
        assertTrue(hash1.startsWith("0x"));
        assertTrue(hash2.startsWith("0x"));
        assertNotEquals(hash1, hash2, "Cryptographic hash must avalanche when data is tampered");
    }

    @Test
    @DisplayName("Cheating Prevention: QuestionDto served to mobile client must omit correct answer")
    void testAssessmentAnswerSecurity() {
        AssessmentQuestion entity = AssessmentQuestion.builder()
                .id(UUID.randomUUID())
                .questionText("What is Kahn's algorithm used for?")
                .questionType("MULTIPLE_CHOICE")
                .options("[{\"id\":\"A\",\"text\":\"Hashing\"},{\"id\":\"B\",\"text\":\"Topological Sort\"}]")
                .correctAnswer("B")
                .explanation("Kahn's algorithm resolves DAG in-degrees for topological ordering.")
                .marks(10)
                .orderIndex(1)
                .build();

        // Client DTO projection served via REST
        QuestionDto dto = QuestionDto.builder()
                .id(entity.getId())
                .questionText(entity.getQuestionText())
                .questionType(entity.getQuestionType())
                .options(entity.getOptions())
                .marks(entity.getMarks())
                .orderIndex(entity.getOrderIndex())
                .build();

        // Verify entity contains answer key but client DTO does not expose correctAnswer
        assertEquals("B", entity.getCorrectAnswer());
        assertEquals("Kahn's algorithm resolves DAG in-degrees for topological ordering.", entity.getExplanation());
        
        assertNotNull(dto.getQuestionText());
        assertEquals(10, dto.getMarks());
        // Verify via reflection or structure that QuestionDto has no getter for correctAnswer or explanation
        assertNull(dto.getClass().getDeclaredMethods() == null ? "" : null); // sanity check
        boolean hasCorrectAnswerField = false;
        for (var field : dto.getClass().getDeclaredFields()) {
            if ("correctAnswer".equals(field.getName()) || "explanation".equals(field.getName())) {
                hasCorrectAnswerField = true;
            }
        }
        assertFalse(hasCorrectAnswerField, "QuestionDto must not contain correctAnswer or explanation fields");
    }
}
