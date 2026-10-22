# SmartEvolve AI — Blockchain-Enabled Self-Evolving AI System for Personalized Learning and Career Guidance

[![Spring Boot 3.3.4](https://img.shields.io/badge/Spring_Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java 21+](https://img.shields.io/badge/Java-21%2B-orange.svg)](https://dev.java/)
[![React Native Expo](https://img.shields.io/badge/React_Native-Expo_52-blue.svg)](https://expo.dev/)
[![Ethereum Solidity](https://img.shields.io/badge/Solidity-0.8.20-lightgrey.svg)](https://soliditylang.org/)
[![Supabase PostgreSQL](https://img.shields.io/badge/Supabase-PostgreSQL_RLS-emerald.svg)](https://supabase.com/)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

SmartEvolve AI is a complete, production-minded, mobile-first engineering application designed for personalized student profiling, adaptive AI recommendations, intelligent career guidance, and blockchain-backed credential verification.

---

## 🚀 Key Innovations & Architectural Pillars

1. **Continuously Adapting Student Profiling**: Student proficiencies are dynamically calibrated from assessment scores and project evidence using damped learning rate formulas.
2. **Prerequisite-Aware Roadmaps**: Kahn's Directed Acyclic Graph (DAG) topological sorting unlocks successor topics only when prerequisites are satisfied.
3. **Intelligent Career Matching Engine**: Evaluates readiness across 15+ industry careers with weighted fulfillment scores, matched/partial/missing skill breakdowns, and explainable insights.
4. **Blockchain Credential Verification**: Achieved milestones are hashed (SHA-256) and anchored to Ethereum EVM smart contracts (`SmartEvolveCredential.sol`) using Web3j, guaranteeing tamper-evident records without exposing student PII on-chain.
5. **Security & Privacy by Design**: Supabase JWT authentication, Row Level Security (RLS) on all user data, and server-side evaluation of assessment answers.

---

## 📁 Repository Structure

```text
SmartEvolveAI/
|-- mobile/                             # React Native Expo Mobile Application
|   |-- app/                            # Expo Router screen navigation
|   |   |-- (auth)/                     # Login and Registration screens
|   |   |-- (tabs)/                     # Home, Learn, Careers, Evolution, Profile
|   |   |-- career/[id].tsx             # Detailed Career Analysis & Skill Gaps
|   |   |-- learning/[id].tsx           # Interactive Lesson Reader
|   |   |-- assessment/[id].tsx         # Quiz taking & Real-time Evaluation
|   |   |-- credentials/index.tsx       # Blockchain Verified Credentials
|   |   |-- settings/index.tsx          # Settings & Secure Logout
|   |   |-- onboarding.tsx              # 4-step interactive onboarding
|   |   |-- index.tsx                   # Splash screen & Auth state check
|   |-- src/
|   |   |-- components/                 # Card, Button, Badge, ProficiencyBar, RadarChart
|   |   |-- theme/                      # Dark navy aesthetic tokens
|   |   |-- types/                      # Full TypeScript data contracts
|   |   |-- api/client.ts               # TanStack Query & SecureStore API fetcher
|   |   |-- store/authContext.tsx       # Auth session persistence
|
|-- backend/                            # Spring Boot 3.3.4 (Java 21) REST Backend
|   |-- src/main/java/com/smartevolve/
|   |   |-- ai/                         # Adaptive Recommendation & Gap Analysis Engine
|   |   |-- blockchain/                 # Web3j Ethereum Smart Contract Service
|   |   |-- config/                     # Security, OpenAPI, Web3j, CORS configs
|   |   |-- controller/                 # 10 REST Controllers (Profile, Career, Quiz, etc.)
|   |   |-- dto/                        # Standardized Request / Response DTOs
|   |   |-- entity/                     # 19 JPA PostgreSQL Database Entities
|   |   |-- repository/                 # Spring Data JPA repositories
|   |   |-- security/                   # Supabase JWT Filter & UserPrincipal
|   |   |-- service/                    # Business Logic & Orchestration Services
|   |-- src/main/resources/
|   |   |-- db/migration/               # Flyway V1 (Schema) & V2 (Seed Data)
|   |   |-- application.yml             # Configurable datasource, JWT & Web3j settings
|   |-- pom.xml                         # Maven dependencies & build config
|
|-- blockchain/                         # Ethereum Smart Contracts (Hardhat & TypeScript)
|   |-- contracts/
|   |   |-- SmartEvolveCredential.sol   # Solidity 0.8.20 Credential Contract
|   |-- scripts/deploy.ts               # Local & Testnet deployment script
|   |-- test/                           # Hardhat test suite (6 passing tests)
|   |-- hardhat.config.ts               # Network & compiler configuration
|
|-- supabase/
|   |-- migrations/                     # Mirrored SQL migrations for Supabase CLI
|
|-- docs/                               # Engineering Documentation
|   |-- architecture.md                 # System diagrams & mathematical formulas
|   |-- database-schema.md              # 19-table ER diagram & column definitions
|   |-- api-documentation.md            # REST API endpoint catalog & request/response samples
|   |-- deployment-guide.md             # Supabase, Render, Hardhat & Expo APK build steps
|   |-- testing-guide.md                # Testing instructions & QA verification
|
|-- README.md
|-- .gitignore
```

---

## 🛠️ Quickstart Guide

### Prerequisites
- Node.js 18+ (v24.13.0 verified)
- Java 21+ (JDK 22 verified)
- Apache Maven 3.9+ (bundled in `C:\tools\maven` or system PATH)

### 1. Compile & Test Smart Contracts
```bash
cd blockchain
npm install
npm test
```
*Expected: 6/6 tests passing (1s)*

### 2. Run Backend Tests & Launch Server
```bash
cd backend
mvn clean test
mvn spring-boot:run
```
*Expected: 9/9 AI unit tests passing; server running on `http://localhost:8080`*  
Interactive API Docs: `http://localhost:8080/swagger-ui.html`

### 3. Launch Mobile App
```bash
cd mobile
npm install
npx expo start
```
- Press `a` to run on Android Emulator.
- Or scan QR code with Expo Go.

---

## 🧪 Testing Summary

- **Backend AI Engine**: All 9 unit tests in `com.smartevolve.ai` (`SkillGapAnalyzerTest`, `ProficiencyCalculatorTest`, `CareerMatchingEngineTest`, `PrerequisiteResolverTest`, `AdaptiveRecommendationEngineTest`) pass 100%.
- **Smart Contracts**: All 6 Hardhat tests in `SmartEvolveCredential.test.ts` pass 100%.
- **Database Schema**: 19 tables, indexes, check constraints, and RLS policies defined in `V1__initial_schema.sql` and seeded with 15 careers, 32 skills, and interactive quizzes in `V2__seed_data.sql`.
