# SmartEvolve AI — Comprehensive System Documentation

## 1. System Overview & Core Capabilities

SmartEvolve AI is an enterprise-grade, mobile-first, blockchain-enabled self-evolving AI system engineered for personalized student learning and career guidance.

### Architecture Pillars:
1. **Dynamic Adaptive Student Profiling**: Calibrates student proficiency dynamically using damped learning rate formulas that resist score hacking while rewarding proven mastery.
2. **Prerequisite-Aware Roadmaps**: Sequences learning resources via Kahn's Directed Acyclic Graph (DAG) topological sorting, unlocking successor modules only when prerequisite proficiencies are met.
3. **Career Matching Engine**: Matches student skill vectors against 15+ industry careers with weighted fulfillment scores, gap breakdowns, and natural language recommendations.
4. **Blockchain Credential Verification**: Issues tamper-evident academic achievement records to an Ethereum EVM smart contract (`SmartEvolveCredential.sol`) via Web3j, protecting student PII through Keccak-256 one-way hashes.
5. **Security & Privacy by Design**: Supabase JWT authentication, PostgreSQL Row-Level Security (RLS), and server-side assessment evaluation.

---

## 2. Technical Stack Specification

| Component | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Mobile Client** | React Native / Expo | Expo 52 / React 18.3 | Cross-platform mobile UX (iOS, Android, Web) |
| **Client Navigation** | Expo Router | v4.0.17 | File-based typed routing |
| **Backend Framework** | Spring Boot | 3.3.4 | REST microservice backend |
| **Language Runtime** | Java | 17 LTS / 21+ | High-concurrency enterprise backend |
| **Database** | PostgreSQL (Supabase) | 15+ with RLS | Relational persistence, 19 tables, migrations |
| **Authentication** | Supabase Auth + JWT | RFC 7519 | Bearer token validation with UserPrincipal |
| **Blockchain** | Ethereum Solidity | 0.8.20 | `SmartEvolveCredential.sol` smart contract |
| **Smart Contract Tooling** | Hardhat & Ethers.js | Hardhat 2.22 / Ethers v6 | Compilation, testing, deployment & gas auditing |
| **Web3 Client** | Web3j | 4.10.3 | Java JSON-RPC blockchain RPC integration |
| **API Documentation** | SpringDoc OpenAPI | 2.6.0 (Swagger 3) | Interactive Swagger UI (`/swagger-ui.html`) |

---

## 3. Database Schema Overview (19 Relational Tables)

The PostgreSQL database enforces relational integrity, user isolation via Row Level Security (RLS), and cryptographic indexing:

1. `profiles`: Student demographic information, headline, target career link, and created timestamp.
2. `skills`: Normalized taxonomy of 32 industry technical and soft skills.
3. `student_skills`: Current proficiency $[0, 100]$, confidence score $[0, 1]$, and verification status per student.
4. `skill_evolution_history`: Immutable time-series audit trail of all proficiency changes with trigger evidence.
5. `careers`: Catalog of 15 career paths with salary ranges, categories, and demand levels.
6. `career_skills`: Join table mapping skills required per career with minimum required proficiency and weights.
7. `student_career_preferences`: Student target career aspirations and selection dates.
8. `learning_resources`: Lessons, tutorials, and YouTube courses categorized by skill and difficulty.
9. `learning_prerequisites`: Directed dependency edges defining prerequisites between learning resources.
10. `learning_progress`: Student resource completion percentage, status (`AVAILABLE`, `IN_PROGRESS`, `COMPLETED`), and completion timestamps.
11. `learning_roadmaps`: Generated DAG sequences customized per student and target career.
12. `roadmap_steps`: Individual topological nodes within a student's active roadmap.
13. `assessments`: Quizzes and skill tests linked to skills and difficulty levels.
14. `assessment_questions`: Multiple-choice questions with answer keys stored server-side.
15. `assessment_attempts`: Record of student test submissions, scores achieved, and time spent.
16. `assessment_responses`: Granular student answers recorded per question for pedagogical analytics.
17. `credentials`: Blockchain-anchored digital certificates with transaction hashes and verification state.
18. `recommendations`: Adaptive AI suggestions with priority scoring and dismissal tracking.
19. `audit_events`: System audit log capturing security, credential issuance, and profile changes.

---

## 4. REST API Endpoints Catalog

Interactive Swagger UI is available at `http://localhost:8080/swagger-ui.html`.

### Authentication & Profile:
- `GET /api/profile/me`: Retrieve current student profile, skills, and preferences.
- `PUT /api/profile/me`: Update student headline, bio, or contact information.
- `POST /api/profile/skills`: Register or update self-reported skills.

### Careers & Matching:
- `GET /api/careers`: List all 15 industry careers with target skill counts.
- `GET /api/careers/{id}`: Detailed career view with student compatibility percentage, matched/missing skills.
- `POST /api/careers/goal`: Set target career goal to regenerate adaptive roadmaps.

### Learning Roadmaps & DAG Sequencing:
- `GET /api/roadmap`: Retrieve topological roadmap steps with status (`AVAILABLE`, `IN_PROGRESS`, `COMPLETED`, `LOCKED`).
- `POST /api/learning/progress/{resourceId}`: Update module progress or mark 100% complete (unlocking successors).

### Formative Assessments & Adaptive Scoring:
- `GET /api/assessments/skill/{skillId}`: Retrieve available quizzes (excluding answers).
- `GET /api/assessments/{id}/questions`: Fetch quiz questions for mobile examination.
- `POST /api/assessments/{id}/submit`: Submit student answers; returns score, points delta, and updated proficiency.

### Evolution & Analytics:
- `GET /api/evolution/history`: Timeline of proficiency adjustments across all assessments.
- `GET /api/dashboard/summary`: High-level student summary (readiness %, completed modules, target career).

### Blockchain Credentials:
- `GET /api/credentials/eligible`: Check milestone achievements eligible for on-chain certification.
- `POST /api/credentials/claim`: Hash achievement data and broadcast minting transaction to EVM smart contract.
- `GET /api/credentials/{id}/verify`: Verify credential integrity against on-chain Ethereum record.

---

## 5. Security & Privacy Audit Verification

1. **PII Masking**: Student UUIDs are never written on-chain in plaintext. A one-way Keccak-256 hash is stored on the contract.
2. **Cheat Prevention**: Assessment correct answers are never transmitted to the mobile client in `QuestionDto`. Answers are validated exclusively server-side.
3. **Double Minting Prevention**: `SmartEvolveCredential.sol` rejects identical credential UUIDs and duplicate achievement hashes.
4. **Access Control**: Only verified owner accounts can designate authorized academic issuing nodes.

