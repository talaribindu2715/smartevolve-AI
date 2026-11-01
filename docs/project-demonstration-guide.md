# SmartEvolve AI — End-to-End Demonstration Guide

This guide provides a comprehensive step-by-step demonstration walkthrough for evaluating, presenting, and verifying the complete SmartEvolve AI system.

---

## 1. Demonstration Environment Preparation

### Step 1: Start the Spring Boot Backend
Open a terminal in the project root:
```powershell
cd backend
mvn spring-boot:run
```
- Wait for the console banner: `Started SmartEvolveApplication in X.XXX seconds`.
- Backend runs on `http://localhost:8080`.
- Verify health status: `http://localhost:8080/api/public/health`.

### Step 2: Open Swagger Interactive API Documentation
Navigate to `http://localhost:8080/swagger-ui.html` in your browser.
- Demonstrates all 11 REST controllers, request/response models, and cryptographic parameters.

### Step 3: Launch Local Blockchain (Hardhat Node)
Open a second terminal:
```powershell
cd blockchain
npx hardhat node
```
- Spawns local EVM node on `http://127.0.0.1:8545` with 20 pre-funded test accounts.
- In another window, deploy contract:
```powershell
npx hardhat run scripts/deploy.ts --network localhost
```

### Step 4: Launch Mobile Application (Expo)
Open a third terminal:
```powershell
cd mobile
npx expo start
```
- Press `w` to open in browser (React Native for Web).
- Or scan QR code with Expo Go on your mobile phone or run on Android emulator (`a`).

---

## 2. Walkthrough Script (10-Stage Demonstration)

### Stage 1: Student Registration & Intelligent Onboarding
1. Launch mobile app -> Splash screen routes to `onboarding.tsx`.
2. Follow the 4-step interactive onboarding explaining AI-driven career matching and blockchain credentials.
3. Tap **Get Started** -> Sign in or register a new student account.

### Stage 2: Personalized Dashboard & Profile Initialization
1. Observe the personalized dashboard on the **Home** tab:
   - Greeting with student name.
   - Initial career compatibility score card.
   - Recommended learning modules ranked by AI urgency.
   - Quick action bar.

### Stage 3: Career Exploration & Goal Setting
1. Tap the **Careers** tab.
2. Browse through 15 pre-seeded engineering careers (Data Analyst, Machine Learning Engineer, Cloud Architect, Full Stack Developer, etc.).
3. Select **Data Analyst**:
   - Notice the dynamic compatibility score (e.g. 72.5%).
   - Inspect the **Matched Skills** (Python, SQL), **Partially Matched** (Tableau), and **Critical Gaps** (Statistical Hypothesis).
   - Read the explainable AI advice explaining which skills will produce the greatest career readiness jump.
4. Tap **Set as My Target Career Goal**.

### Stage 4: Prerequisite-Aware Roadmap (DAG Sequencing)
1. Tap the **Learn** tab.
2. The roadmap displays modules sequenced using Kahn's topological sort:
   - Step 1 & 2 are marked `COMPLETED` or `AVAILABLE`.
   - Subsequent steps (e.g., Step 4) are locked (`LOCKED`) with a padlock icon because their prerequisite modules have not yet been finished.
3. Open an available module -> Read lesson text -> Click **Mark as Completed (100%)**.
4. Return to the roadmap: observe the immediate real-time unlocking of the downstream successor module (`AVAILABLE`).

### Stage 5: Formative Skill Assessment & Server-Side Scoring
1. Tap on an assessment quiz (e.g., *Python Mastery* or *SQL Queries*).
2. Note that question choices are shown, but answer keys are completely withheld from the client bundle (preventing inspect-element cheating).
3. Answer all questions -> Tap **Submit Assessment**.
4. The server validates responses, scores the test, and immediately returns:
   - Percentage score (e.g., 90%).
   - Correct count (9/10).
   - Pedagogical explanations for incorrect questions.

### Stage 6: Adaptive Damped Proficiency Recalibration
1. Tap the **Evolution** tab.
2. Observe the real-time update in the student's proficiency history:
   - See the exact mathematical delta (e.g., $+6.4\%$ in Python).
   - Damping factor applied: subsequent attempts damp delta swings, preventing score gaming while rewarding mastery.
   - Confidence score increases as verified assessment evidence accumulates.
   - Inspect the skill evolution graph illustrating the student's learning trajectory over time.

### Stage 7: Blockchain Milestone Certification
1. Once an assessment achieves $\ge 80\%$, the student qualifies for a verified milestone credential.
2. Navigate to **Credentials** -> Tap **Claim Verified Blockchain Credential**.
3. Backend executes:
   - SHA-256 hash of achievement metadata.
   - Keccak-256 hash of student UUID to mask PII on-chain.
   - Submits Web3j transaction to `SmartEvolveCredential.sol`.
4. Credential appears on screen with transaction hash, block number, and issuing institution address.

### Stage 8: Tamper-Evident Verification
1. Tap **Verify Credential On Blockchain**.
2. Smart contract verifies that the cryptographic achievement hash recorded on-chain exactly matches the certificate payload.
3. An emerald verification badge confirms on-chain authenticity (`CONFIRMED ✓`).
4. Disclose how any tampered hash immediately triggers a cryptographic failure warning.

### Stage 9: Experimental Simulation Review
1. Open `docs/experiments/simulation-report.md`.
2. Review the empirical results of the **2,000 learners $\times$ 10 random seeds** simulation:
   - Damped algorithm reduces late-stage volatility by **74%** compared to Constant Rate.
   - Running Mean locks students into early mistakes, whereas Damped Rate preserves mobility.
   - Kahn's DAG benchmark demonstrates **2.6 million nodes/second** sorting throughput.
3. Present the 5 high-resolution generated figures in `docs/experiments/figures/`.

### Stage 10: Smart Contract Gas & Security Verification
1. Review the gas audit table:
   - Free gasless read-only verification calls (`verifyCredential.staticCall`).
   - Fixed, affordable minting cost ($235,000$ gas).
   - Rejection of duplicate certificates and unauthorized issuers verified across 6 passing Hardhat tests.

