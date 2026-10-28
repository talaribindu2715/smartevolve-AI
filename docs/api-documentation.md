# SmartEvolve AI — REST API Documentation

Base URL: `http://localhost:8080` (or `http://10.0.2.2:8080` on Android Emulator / Production Cloud URL)  
Swagger UI Interactive Documentation: `http://localhost:8080/swagger-ui.html`  
OpenAPI JSON Specification: `http://localhost:8080/v3/api-docs`

---

## 1. Authentication Header
All endpoints under `/api/**` (except `/api/public/**`) require a valid Supabase JWT Bearer token:
```http
Authorization: Bearer <supabase_access_token>
```

---

## 2. API Endpoints

### Student Profile
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/profiles/me` | Fetch authenticated student profile |
| `PUT` | `/api/profiles/me` | Update student profile and onboarding status |

**PUT `/api/profiles/me` Request Body:**
```json
{
  "fullName": "Alex Chen",
  "educationLevel": "Undergraduate B.Tech",
  "institution": "National Institute of Technology",
  "branch": "Computer Science",
  "graduationYear": 2027,
  "onboardingCompleted": true
}
```

---

### Dashboard Metrics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Get real-time aggregated student dashboard data |

**Sample Response:**
```json
{
  "studentName": "Alex Chen",
  "onboardingCompleted": true,
  "targetCareerId": "10000000-0000-0000-0000-000000000003",
  "targetCareerName": "Data Analyst",
  "overallProficiency": 48.5,
  "careerReadinessScore": 62.0,
  "readinessLevel": "DEVELOPING",
  "totalSkillsAssessed": 6,
  "completedActivitiesCount": 3,
  "pendingAssessmentsCount": 2,
  "topSkills": [...],
  "recentlyImprovedSkills": [...],
  "activeRoadmap": {...},
  "recommendations": [...],
  "verifiedCredentials": [...]
}
```

---

### Skills & Self-Reporting
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/skills` | List all 32 industry skills across 8 categories |
| `GET` | `/api/skills/my` | Get authenticated student's calibrated skills |
| `POST` | `/api/skills/self-report` | Record/update initial self-reported skill rating |

**POST `/api/skills/self-report` Request Body:**
```json
{
  "skillId": "00000000-0000-0000-0001-000000000001",
  "proficiency": 45.0,
  "selfRating1To5": 3
}
```

---

### Careers & Gap Analysis
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/careers` | List all 15 industry careers with compatibility score |
| `GET` | `/api/careers/{id}` | Get career detail, matched vs missing skills, and gap analysis |
| `POST` | `/api/careers/{id}/set-goal` | Activate target career goal and generate adaptive roadmap |

---

### Learning Modules & Progress
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/learning` | List learning resources with prerequisite unlock status |
| `GET` | `/api/learning/{id}` | Get module content body, objectives, and prerequisites |
| `POST` | `/api/learning/progress` | Update completion progress (e.g. COMPLETED 100%) |

**POST `/api/learning/progress` Request Body:**
```json
{
  "resourceId": "20000000-0000-0000-0001-000000000001",
  "status": "COMPLETED",
  "progressPercentage": 100.0
}
```

---

### Quizzes & Formative Assessments
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/assessments` | List available skill assessments |
| `GET` | `/api/assessments/{id}` | Fetch quiz questions (correct answers omitted for security) |
| `POST` | `/api/assessments/submit` | Submit answers, recalculate proficiency, return review |

**POST `/api/assessments/submit` Request Body:**
```json
{
  "assessmentId": "30000000-0000-0000-0001-000000000001",
  "timeTakenSeconds": 180,
  "responses": [
    { "questionId": "40000000-0000-0000-0001-000000000001", "submittedAnswer": "B" },
    { "questionId": "40000000-0000-0000-0001-000000000002", "submittedAnswer": "C" }
  ]
}
```

---

### Skill Evolution & Performance Trends
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/evolution/history` | Timeline of skill evolution events and change reasons |
| `GET` | `/api/evolution/trends` | Growth trajectory, velocity, and top improving skills |

---

### Blockchain Credentials
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/credentials` | List all blockchain credentials issued to student |
| `POST` | `/api/credentials/{id}/verify` | Execute on-chain verification on Ethereum smart contract |

---

### YouTube Educational Video Pipeline
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/youtube/videos` | Stream and filter educational YouTube masterclasses |
| `GET` | `/api/youtube/videos/{id}` | Detailed video metadata, embed URL, and learner progress |
| `GET` | `/api/youtube/recommended` | AI-targeted video recommendations based on skill deficits |
| `GET` | `/api/youtube/skills` | High-level summary of skills with available video counts |
| `POST` | `/api/youtube/progress` | Track watch completion and calibrate student proficiency |
| `POST` | `/api/youtube/ingest` | Dynamic ingestion from YouTube Data API v3 |

**POST `/api/youtube/progress` Request Body:**
```json
{
  "videoId": "20000000-0000-0000-0000-000000000001",
  "youtubeVideoId": "rfscVS0vtbw",
  "watchedSeconds": 1500,
  "totalSeconds": 1500,
  "status": "COMPLETED"
}
```

