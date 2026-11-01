# SmartEvolve AI — Implemented Modules & UI Architecture

This document provides visual screen layouts, UI architecture, and component previews for all key user modules in SmartEvolve AI.

---

## 1. Module Layout Index

1. **Authentication & Onboarding**: Multi-step onboarding, student login, registration.
2. **Student Dashboard (Home)**: High-level overview, target career progress ring, daily recommendations.
3. **Career Exploration & Match Engine**: Compatibility percentages, skill gap analysis (Matched, Partial, Missing).
4. **Learning Roadmap (DAG Topology)**: Kahn's DAG prerequisite ordering, step states (`AVAILABLE`, `IN_PROGRESS`, `COMPLETED`, `LOCKED`).
5. **Interactive Lesson & Quiz Runner**: Real-time multiple-choice evaluation, server-side score computation.
6. **Adaptive Evolution History**: Visual timeline of proficiency recalibration and confidence growth.
7. **Blockchain Credentials & Verification**: On-chain verification badge, transaction hash, tamper-evident check.
8. **Swagger API Interactive Interface**: OpenAPI 3.0 visual REST explorer.

---

## 2. Screen Visual Architectural Layouts

### 2.1 Student Dashboard (`mobile/app/(tabs)/index.tsx`)
```text
+-------------------------------------------------------------+
| SmartEvolve AI                           [Notification] [⚙] |
| Hello, Alex Rivera! 👋                                      |
| "Level up your data analytics skills today"                 |
+-------------------------------------------------------------+
| TARGET CAREER GOAL                                          |
| [Icon] Data Analyst                                         |
| Compatibility: [============= 72% =============] READY      |
| Matched: 6/8 Skills  |  Critical Gaps: 2 Skills             |
+-------------------------------------------------------------+
| ADAPTIVE AI RECOMMENDATIONS                                 |
| * [Lesson] Advanced SQL Window Functions        [Priority 1]|
|   Est: 25 min | Difficulty: ADVANCED                        |
| * [Quiz] Python Data Wrangling Mastery          [Priority 2]|
|   10 Questions | +12% Expected Impact                       |
+-------------------------------------------------------------+
| ACTIVE ROADMAP PROGRESS                                     |
| Step 3 of 8: Pandas GroupBy & Aggregations                  |
| Status: IN PROGRESS (65% Completed)                         |
+-------------------------------------------------------------+
| [Home]     [Learn]     [Careers]     [Evolution]  [Profile] |
+-------------------------------------------------------------+
```

### 2.2 Career Guidance & Skill Gap Engine (`mobile/app/career/[id].tsx`)
```text
+-------------------------------------------------------------+
| < Back to Careers                                           |
| Data Analyst                                                |
| Match Score: 72.5%                                          |
| Readiness: HIGH_POTENTIAL                                   |
| [ Set as My Target Career Goal ]                            |
+-------------------------------------------------------------+
| SKILL GAP BREAKDOWN                                         |
|                                                             |
| MATCHED SKILLS (>= Required):                               |
| [✓] Python Programming        Current: 82% | Req: 80%       |
| [✓] Relational Databases (SQL) Current: 78% | Req: 75%       |
|                                                             |
| PARTIALLY MATCHED (50% - 99%):                              |
| [!] Tableau & BI Dashboards   Current: 55% | Req: 70%       |
|                                                             |
| CRITICAL SKILL GAPS (< 50%):                                |
| [x] Statistical Hypothesis    Current: 20% | Req: 75%       |
|     Deficit: 55% | Priority: CRITICAL (Weight: 1.5x)        |
+-------------------------------------------------------------+
| EXPLAINABLE AI INSIGHT                                      |
| "You fully meet 6 of 8 required skills. Priority growth is  |
|  needed in Statistical Hypothesis and Tableau. Completing   |
|  target modules will accelerate your career readiness."     |
+-------------------------------------------------------------+
```

### 2.3 Learning Roadmap with DAG Prerequisite Locking (`mobile/app/(tabs)/learn.tsx`)
```text
+-------------------------------------------------------------+
| Personalized Learning Roadmap                               |
| Target: Data Analyst Track                                  |
+-------------------------------------------------------------+
| Step 1: Python Fundamentals [COMPLETED ✓]                   |
| ↳ Prerequisites: None                                       |
|                                                             |
| Step 2: SQL Basics & Queries [COMPLETED ✓]                  |
| ↳ Prerequisites: None                                       |
|                                                             |
| Step 3: Pandas & DataFrames [AVAILABLE ▶]                   |
| ↳ Prerequisites: Python Fundamentals (Satisfied ✓)          |
|   [ Open Module & Start Learning ]                          |
|                                                             |
| Step 4: Statistical Testing & ANOVA [LOCKED 🔒]             |
| ↳ Prerequisites: Step 3 (Pandas) (Pending Incomplete)       |
|   Requires completion of Step 3 before unlocking            |
+-------------------------------------------------------------+
```

### 2.4 Skill Assessment & Quiz Module (`mobile/app/assessment/[id].tsx`)
```text
+-------------------------------------------------------------+
| Assessment: Python Mastery (Advanced)                       |
| Question 4 of 10                                            |
| Marks: 10                                                   |
+-------------------------------------------------------------+
| Question:                                                   |
| Which built-in Python module is best suited for computing   |
| running statistical averages with high floating precision?  |
|                                                             |
| ( ) A. math                                                 |
| (•) B. decimal                                              |
| ( ) C. statistics                                           |
| ( ) D. fractions                                            |
+-------------------------------------------------------------+
|                                  [Previous]   [Next / Submit]|
+-------------------------------------------------------------+
| SERVER-SIDE EVALUATION RESULT (On Submit):                  |
| Score: 90.0% (9/10 Correct)                                 |
| Adaptive Delta: +6.4% in Python Programming                 |
| Confidence: 0.88 (+0.08 damping calibrated)                 |
| Achievement Milestone: "Advanced Python Mastery" Unlocked!  |
+-------------------------------------------------------------+
```

### 2.5 Blockchain Credential Verification (`mobile/app/credentials/index.tsx`)
```text
+-------------------------------------------------------------+
| Verified Academic Credentials                               |
| Backed by Ethereum Smart Contract (Paris EVM)               |
+-------------------------------------------------------------+
| CERTIFICATE: Data Analyst Career Ready                      |
| Credential ID: cred-uuid-783921                             |
| Status: BLOCKCHAIN CONFIRMED ✓                              |
| Issuer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266         |
| Issued Date: 2026-11-01 21:45:00 UTC                        |
|                                                             |
| Cryptographic Proof:                                        |
| Student Hash (Keccak-256):                                  |
| 0x7a8b...3f92 (Student PII protected)                       |
|                                                             |
| Achievement Hash (SHA-256):                                 |
| 0x4c2e...88b1 (Tamper-evident digest)                       |
|                                                             |
| Ethereum Tx Hash:                                           |
| 0x9e12...b45a (Block #1)                                    |
|                                                             |
| [ Verify Credential On Blockchain ]                         |
| Result: VALID ✓ (Smart contract record matches digest)     |
+-------------------------------------------------------------+
```

### 2.6 Swagger OpenAPI 3.0 Explorer
```text
+-------------------------------------------------------------+
| OpenAPI 3.0.1  |  SmartEvolve AI Backend API                |
| http://localhost:8080/swagger-ui.html                       |
+-------------------------------------------------------------+
| > analytics-controller : Pedagogical Trends & Dashboards    |
| > assessment-controller : Quizzes, Submissions & Scoring   |
| > career-controller : Career Readiness & Skill Gaps        |
| > credential-controller : Web3j Ethereum Verification       |
| > dashboard-controller : Student Summary Aggregation       |
| > evolution-controller : Damped Proficiency History        |
| > learning-controller : Lessons, Modules & Video Tracking  |
| > profile-controller : Student Profile & Self-Reports       |
| > public-health-controller : Readiness & Liveness Probes   |
| > roadmap-controller : Kahn's DAG Prerequisite Ordering    |
| > you-tube-controller : Automated Educational Pipeline     |
+-------------------------------------------------------------+
```

