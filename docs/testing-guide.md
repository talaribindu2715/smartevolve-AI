# SmartEvolve AI — Testing & Quality Assurance Guide

This document explains how to execute tests across the full SmartEvolve AI system, including backend AI algorithms, smart contracts, and mobile components.

---

## 1. Backend AI Engine & REST API Tests

The Spring Boot backend uses **JUnit 5**, **Mockito**, and **Spring Security Test**. All AI algorithms have dedicated unit test suites:
- `SkillGapAnalyzerTest`: Tests weighted deficit formulas, threshold priorities (CRITICAL, HIGH, MEDIUM, MASTERED).
- `ProficiencyCalculatorTest`: Tests adaptive learning rate updates, attempt count damping, and [0, 100] bounds.
- `CareerMatchingEngineTest`: Tests career readiness percentage, matched vs missing skills, and explainable insights.
- `PrerequisiteResolverTest`: Tests topological DAG sorting and prerequisite unlock evaluation.
- `AdaptiveRecommendationEngineTest`: Tests exclusion of completed resources and priority boosting.

### Executing Backend Tests:
```powershell
cd backend
mvn clean test
```

Expected output:
```text
[INFO] Running com.smartevolve.ai.AdaptiveRecommendationEngineTest
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.smartevolve.ai.CareerMatchingEngineTest
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.smartevolve.ai.PrerequisiteResolverTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.smartevolve.ai.ProficiencyCalculatorTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.smartevolve.ai.SkillGapAnalyzerTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] Results:
[INFO] Tests run: 9, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 2. Blockchain Smart Contract Tests

The Solidity smart contract `SmartEvolveCredential.sol` is tested using **Hardhat** and **Ethers.js**:
- Owner deployment and authorization checks.
- Authorized credential issuance with cryptographic hashes.
- Rejection of duplicate credential IDs or duplicate achievement hashes.
- Unauthorized caller access control protection.
- On-chain verification with valid vs invalid hashes.
- Credential revocation and revoked state verification.

### Executing Smart Contract Tests:
```powershell
cd blockchain
npm test
```

Expected output:
```text
  SmartEvolveCredential Smart Contract
    ✔ should deploy with the correct owner and initial issuer authorization
    ✔ should allow an authorized issuer to issue a verifiable achievement credential
    ✔ should prevent duplicate credential ID or duplicate achievement hash registration
    ✔ should reject unauthorized callers from issuing credentials
    ✔ should successfully verify on-chain records and detect invalid hashes
    ✔ should allow revoking a credential and reflect revoked state in verification

  6 passing (1s)
```

---

## 3. End-to-End User Journey Verification

To verify the integrated system:
1. Launch the mobile app:
   ```bash
   cd mobile
   npx expo start
   ```
2. Sign in with the built-in demo credentials or register a new student account.
3. Observe the personalized dashboard: target career, readiness score, and recommendations.
4. Select **Careers** -> pick **Data Analyst** -> click **Set as My Target Career Goal**.
5. Switch to **Learn** tab -> notice how steps are sequenced topologically with prerequisites.
6. Open an available module -> click **Mark Module as Completed (100%)**.
7. Return to roadmap -> observe the next step unlocking automatically (`AVAILABLE`).
8. Take a quiz -> submit responses -> notice your score, updated proficiency (+%), and evolution history timeline.
9. Open **Credentials** -> click **Verify Credential On Blockchain** -> observe the on-chain confirmation.
