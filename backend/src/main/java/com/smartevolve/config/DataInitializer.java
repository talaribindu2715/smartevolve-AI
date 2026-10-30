package com.smartevolve.config;

import com.smartevolve.entity.*;
import com.smartevolve.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final SkillRepository skillRepository;
    private final CareerRepository careerRepository;
    private final CareerSkillRepository careerSkillRepository;
    private final LearningResourceRepository learningResourceRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentQuestionRepository assessmentQuestionRepository;
    private final ProfileRepository profileRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final YouTubeVideoRepository youTubeVideoRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (skillRepository.count() > 0) {
            log.info("Database already contains data, skipping DataInitializer.");
            return;
        }

        log.info("Initializing in-memory database with industry skills, careers, learning resources, and demo data...");

        // 1. Create Skills
        Map<String, Skill> skills = new HashMap<>();
        String[][] skillData = {
            {"Python", "Programming", "Core Python programming, OOP, functional paradigms, standard library."},
            {"Java", "Programming", "Java 21+, object-oriented architecture, JVM concurrency, Spring ecosystem."},
            {"JavaScript", "Programming", "Modern ECMAScript, asynchronous programming, DOM manipulation."},
            {"TypeScript", "Programming", "Static typing, generics, interfaces, compiler config."},
            {"SQL", "Programming", "Relational database querying, multi-table joins, subqueries, CTEs, and window functions."},
            {"PostgreSQL", "Databases", "Relational database modeling, indexes, query plans, triggers, and JSONB."},
            {"MongoDB", "Databases", "Document-oriented NoSQL database design, aggregation pipelines, and sharding."},
            {"Redis", "Databases", "In-memory key-value data store, caching strategies, pub/sub, and session management."},
            {"Pandas & NumPy", "Data Analysis", "Dataframe manipulation, vectorized calculations, and aggregation."},
            {"Statistics", "Data Analysis", "Probability distributions, hypothesis testing, p-values, regression."},
            {"Power BI", "Data Analysis", "Business intelligence reporting, DAX measures, data modeling, dashboards."},
            {"Data Visualization", "Data Analysis", "Storytelling with data using Matplotlib, Seaborn, and charts."},
            {"Machine Learning", "Artificial Intelligence", "Supervised/unsupervised algorithms, scikit-learn, metric evaluation."},
            {"Deep Learning", "Artificial Intelligence", "Neural networks, PyTorch/TensorFlow, backpropagation, CNNs, transformers."},
            {"Natural Language Processing", "Artificial Intelligence", "Tokenization, embeddings, text classification, transformers."},
            {"Prompt Engineering & LLMs", "Artificial Intelligence", "Zero-shot prompting, RAG architectures, vector embeddings, LangChain."},
            {"React & React Native", "Web Development", "Component lifecycles, hooks, mobile rendering, and Expo Router."},
            {"Spring Boot", "Web Development", "Spring framework, dependency injection, JPA/Hibernate, Spring Security."},
            {"Node.js", "Web Development", "Event-driven backend development, Express/Fastify, middleware."},
            {"RESTful API Design", "Web Development", "HTTP semantics, status codes, OpenAPI/Swagger specifications."},
            {"Docker", "Cloud and DevOps", "Containerization, Dockerfile optimization, multi-stage builds, and Compose."},
            {"Kubernetes", "Cloud and DevOps", "Container orchestration, pods, deployments, services, ingress."},
            {"CI/CD Pipelines", "Cloud and DevOps", "Automated testing and deployment using GitHub Actions and registries."},
            {"AWS Cloud Core", "Cloud and DevOps", "EC2, S3, RDS, Lambda, IAM permissions, VPC networking."},
            {"Linux Administration", "Cloud and DevOps", "Shell scripting, file permissions, systemd service management."},
            {"Cybersecurity Fundamentals", "Security and QA", "Network security, OWASP Top 10 vulnerabilities, cryptography."},
            {"Software Testing & QA", "Security and QA", "Unit testing with JUnit/Jest, integration testing, mocking."},
            {"Data Structures & Algorithms", "Aptitude and Problem Solving", "Arrays, linked lists, trees, graphs, sorting, searching, DP."},
            {"System Design", "Aptitude and Problem Solving", "High-level architecture, scalability, load balancing, caching."},
            {"Agile & Scrum", "Communication", "Sprint planning, user stories, retrospectives, Jira collaboration."},
            {"Technical Communication", "Communication", "Design docs, RFC proposals, stakeholder presentations."}
        };

        for (String[] s : skillData) {
            Skill skill = skillRepository.save(Skill.builder()
                .name(s[0])
                .category(s[1])
                .description(s[2])
                .build());
            skills.put(s[0], skill);
        }

        // 2. Create Careers
        Map<String, Career> careers = new HashMap<>();
        String[][] careerData = {
            {"AI Engineer", "Architect and deploy artificial intelligence models, generative AI pipelines, and agentic workflows.", "AI & Data Science"},
            {"Machine Learning Engineer", "Design, train, optimize, and serve scalable predictive ML models using deep learning frameworks.", "AI & Data Science"},
            {"Data Analyst", "Transform raw structured data into actionable business intelligence through dashboards and SQL.", "Data & Analytics"},
            {"Data Scientist", "Extract deep insights from complex data using advanced statistical modeling and machine learning.", "AI & Data Science"},
            {"Full-Stack Developer", "Develop robust end-to-end web applications covering user interfaces, RESTful APIs, and cloud hosting.", "Software Engineering"},
            {"Backend Developer", "Engineer high-throughput server-side services, data pipelines, caching layers, and microservices.", "Software Engineering"},
            {"Frontend Developer", "Craft responsive, intuitive, and performant user experiences using modern JavaScript/TypeScript.", "Software Engineering"},
            {"Mobile App Developer", "Create cross-platform and native mobile experiences with React Native, Expo, and device APIs.", "Mobile Development"},
            {"Java Developer", "Build mission-critical enterprise applications and microservices using modern Java and Spring Boot.", "Enterprise Software"},
            {"Cloud Engineer", "Provision, automate, and monitor secure multi-tier infrastructure on public cloud platforms.", "Cloud & Infrastructure"},
            {"DevOps Engineer", "Automate CI/CD pipelines, container orchestration with Kubernetes, and observability systems.", "Cloud & Infrastructure"},
            {"Cybersecurity Analyst", "Protect organizational systems against cyber threats and implement zero-trust architectures.", "Security"}
        };

        for (String[] c : careerData) {
            Career career = careerRepository.save(Career.builder()
                .name(c[0])
                .description(c[1])
                .category(c[2])
                .active(true)
                .build());
            careers.put(c[0], career);
        }

        // 3. Link Career Skills
        addCareerSkill(careers.get("AI Engineer"), skills.get("Python"), 90.0, 1.5);
        addCareerSkill(careers.get("AI Engineer"), skills.get("Machine Learning"), 85.0, 1.4);
        addCareerSkill(careers.get("AI Engineer"), skills.get("Deep Learning"), 80.0, 1.3);
        addCareerSkill(careers.get("AI Engineer"), skills.get("Prompt Engineering & LLMs"), 85.0, 1.4);
        addCareerSkill(careers.get("AI Engineer"), skills.get("RESTful API Design"), 70.0, 1.0);

        addCareerSkill(careers.get("Full-Stack Developer"), skills.get("JavaScript"), 85.0, 1.3);
        addCareerSkill(careers.get("Full-Stack Developer"), skills.get("TypeScript"), 80.0, 1.2);
        addCareerSkill(careers.get("Full-Stack Developer"), skills.get("React & React Native"), 85.0, 1.4);
        addCareerSkill(careers.get("Full-Stack Developer"), skills.get("Spring Boot"), 75.0, 1.2);
        addCareerSkill(careers.get("Full-Stack Developer"), skills.get("PostgreSQL"), 75.0, 1.1);

        addCareerSkill(careers.get("Java Developer"), skills.get("Java"), 90.0, 1.6);
        addCareerSkill(careers.get("Java Developer"), skills.get("Spring Boot"), 85.0, 1.5);
        addCareerSkill(careers.get("Java Developer"), skills.get("PostgreSQL"), 80.0, 1.2);
        addCareerSkill(careers.get("Java Developer"), skills.get("Data Structures & Algorithms"), 80.0, 1.2);
        addCareerSkill(careers.get("Java Developer"), skills.get("Docker"), 70.0, 1.0);

        addCareerSkill(careers.get("Mobile App Developer"), skills.get("TypeScript"), 85.0, 1.3);
        addCareerSkill(careers.get("Mobile App Developer"), skills.get("React & React Native"), 90.0, 1.6);
        addCareerSkill(careers.get("Mobile App Developer"), skills.get("RESTful API Design"), 80.0, 1.1);
        addCareerSkill(careers.get("Mobile App Developer"), skills.get("Software Testing & QA"), 70.0, 1.0);

        addCareerSkill(careers.get("Data Analyst"), skills.get("SQL"), 85.0, 1.5);
        addCareerSkill(careers.get("Data Analyst"), skills.get("Pandas & NumPy"), 80.0, 1.3);
        addCareerSkill(careers.get("Data Analyst"), skills.get("Power BI"), 80.0, 1.3);
        addCareerSkill(careers.get("Data Analyst"), skills.get("Statistics"), 70.0, 1.1);

        // 4. Learning Resources
        createResource("Mastering Python for AI", "Core Python syntax, list comprehensions, decorators, and asynchronous programming.", skills.get("Python"), "BEGINNER", 45, "ARTICLE", "https://docs.python.org/3/tutorial/");
        createResource("Python Video Masterclass: Fast-Track Crash Course", "Visual crash course covering Python variables, functions, OOP, and data structures.", skills.get("Python"), "BEGINNER", 60, "VIDEO", "https://www.youtube.com/watch?v=_uQrJ0TkZlc");
        createResource("Spring Boot 3 & Microservices Architecture", "Building production-ready REST services with Spring Boot, JPA, and JWT security.", skills.get("Spring Boot"), "INTERMEDIATE", 90, "ARTICLE", "https://spring.io/guides");
        createResource("Spring Boot 3 Video Masterclass: Production REST APIs", "Step-by-step video tutorial on building Spring Boot 3 microservices with PostgreSQL.", skills.get("Spring Boot"), "INTERMEDIATE", 135, "VIDEO", "https://www.youtube.com/watch?v=9SGDpanrc8U");
        createResource("React Native & Expo Modern Guide", "Building fluid, high-performance mobile apps with Expo Router and TypeScript.", skills.get("React & React Native"), "INTERMEDIATE", 60, "ARTICLE", "https://docs.expo.dev/");
        createResource("React Native Video Masterclass: Cross-Platform Apps", "Comprehensive video tutorial building complete iOS and Android applications.", skills.get("React & React Native"), "INTERMEDIATE", 160, "VIDEO", "https://www.youtube.com/watch?v=0-S5a0eXPoc");
        createResource("Generative AI & LLM Prompt Engineering", "Prompt techniques, few-shot examples, retrieval augmented generation (RAG).", skills.get("Prompt Engineering & LLMs"), "INTERMEDIATE", 50, "ARTICLE", "https://learnprompting.org/");
        createResource("Large Language Models & State of GPT Video", "Andrej Karpathy's masterclass breakdown of modern transformer LLMs.", skills.get("Prompt Engineering & LLMs"), "INTERMEDIATE", 42, "VIDEO", "https://www.youtube.com/watch?v=bZQun8Y4L2A");
        createResource("Docker & Containerization Fundamentals", "Containerizing full-stack microservices with multi-stage Dockerfiles.", skills.get("Docker"), "BEGINNER", 40, "ARTICLE", "https://docs.docker.com/");

        // 4b. Seed Curated YouTube Educational Pipeline
        seedYouTubeVideos(skills);

        // 5. Create Assessments
        Assessment pythonQuiz = assessmentRepository.save(Assessment.builder()
            .title("Python Core Diagnostic Quiz")
            .skill(skills.get("Python"))
            .difficulty("INTERMEDIATE")
            .assessmentType("QUIZ")
            .active(true)
            .build());

        assessmentQuestionRepository.save(AssessmentQuestion.builder()
            .assessment(pythonQuiz)
            .questionText("Which built-in data type in Python is mutable and maintains insertion order?")
            .questionType("MULTIPLE_CHOICE")
            .options("[{\"id\":\"A\",\"text\":\"Tuple\"},{\"id\":\"B\",\"text\":\"List\"},{\"id\":\"C\",\"text\":\"Set\"},{\"id\":\"D\",\"text\":\"Frozenset\"}]")
            .correctAnswer("B")
            .explanation("Python lists are mutable ordered sequences.")
            .marks(1)
            .orderIndex(1)
            .build());

        assessmentQuestionRepository.save(AssessmentQuestion.builder()
            .assessment(pythonQuiz)
            .questionText("What keyword is used in Python to create a generator function?")
            .questionType("MULTIPLE_CHOICE")
            .options("[{\"id\":\"A\",\"text\":\"return\"},{\"id\":\"B\",\"text\":\"yield\"},{\"id\":\"C\",\"text\":\"produce\"},{\"id\":\"D\",\"text\":\"async\"}]")
            .correctAnswer("B")
            .explanation("The yield statement turns a regular function into a generator.")
            .marks(1)
            .orderIndex(2)
            .build());

        // 6. Demo Profile & Student Skills
        UUID demoStudentId = UUID.fromString("00000000-0000-0000-0000-000000000001");
        Profile demoProfile = profileRepository.save(Profile.builder()
            .id(demoStudentId)
            .fullName("Alex Chen")
            .educationLevel("Undergraduate B.Tech")
            .institution("MIT Engineering")
            .branch("Computer Science")
            .graduationYear(2027)
            .interests("AI, Machine Learning, Data Analytics")
            .preferredLearningStyle("Hands-on Projects & Video Masterclasses")
            .academicGoals("Specialize in Cloud-Native AI Pipelines and Full-Stack Architecture")
            .onboardingCompleted(true)
            .build());

        studentSkillRepository.save(StudentSkill.builder()
            .student(demoProfile)
            .skill(skills.get("Python"))
            .proficiency(BigDecimal.valueOf(82.5))
            .confidence(BigDecimal.valueOf(0.85))
            .evidenceType("ASSESSMENT_VERIFIED")
            .build());

        studentSkillRepository.save(StudentSkill.builder()
            .student(demoProfile)
            .skill(skills.get("React & React Native"))
            .proficiency(BigDecimal.valueOf(75.0))
            .confidence(BigDecimal.valueOf(0.80))
            .evidenceType("PROJECT_SUBMISSION")
            .build());

        studentSkillRepository.save(StudentSkill.builder()
            .student(demoProfile)
            .skill(skills.get("Spring Boot"))
            .proficiency(BigDecimal.valueOf(68.0))
            .confidence(BigDecimal.valueOf(0.72))
            .evidenceType("SELF_REPORTED")
            .build());

        log.info("SmartEvolve in-memory database initialized successfully with {} skills, {} careers, and YouTube educational pipeline.",
            skills.size(), careers.size());
    }

    private void seedYouTubeVideos(Map<String, Skill> skills) {
        // Python
        saveVideo("rfscVS0vtbw", "Python Tutorial for Beginners - Full Course [2024]",
                "Comprehensive Python course covering installation, syntax, variables, lists, functions, and object-oriented design.",
                skills.get("Python"), "BEGINNER", "freeCodeCamp.org", "4:26:52", 266, "42M views");
        saveVideo("_uQrJ0TkZlc", "Python for Beginners - Fast-Track Practical Guide",
                "Learn Python in 1 hour with hands-on coding exercises, logic structures, and real-world examples.",
                skills.get("Python"), "BEGINNER", "Programming with Mosh", "1:00:15", 60, "38M views");

        // Java & Spring Boot
        saveVideo("A74TOX803D0", "Java Full Course - Modern Java 21 & Concurrency",
                "Master modern Java, records, virtual threads, streams API, and enterprise OOP patterns.",
                skills.get("Java"), "INTERMEDIATE", "freeCodeCamp.org", "9:33:04", 573, "5.8M views");
        saveVideo("9SGDpanrc8U", "Spring Boot 3 Full Course 2024 - Enterprise REST APIs",
                "Build full-scale Spring Boot REST microservices with Spring Data JPA, PostgreSQL, Docker, and Spring Security.",
                skills.get("Spring Boot"), "INTERMEDIATE", "Amigoscode", "2:15:30", 135, "1.1M views");

        // React & React Native
        saveVideo("0-S5a0eXPoc", "React Native Crash Course 2024 - Build Mobile Apps",
                "Build iOS and Android applications with Expo Router, state management, animated components, and native APIs.",
                skills.get("React & React Native"), "INTERMEDIATE", "freeCodeCamp.org", "2:40:00", 160, "980K views");
        saveVideo("Tn6-PIqc4UM", "React in 100 Seconds // Quickstart Architecture",
                "High-velocity overview of React components, virtual DOM, hooks, and architectural patterns.",
                skills.get("React & React Native"), "BEGINNER", "Fireship", "2:24", 3, "2.4M views");

        // Artificial Intelligence & Machine Learning
        saveVideo("i_LwzRVP7bg", "Machine Learning for Beginners - Full Mathematical Course",
                "Understand linear regression, decision trees, neural network math, scikit-learn, and model evaluation metrics.",
                skills.get("Machine Learning"), "BEGINNER", "freeCodeCamp.org", "9:52:14", 592, "2.3M views");
        saveVideo("aircAruvnKk", "Neural Networks & Deep Learning Foundations",
                "Visual geometric intuition behind backpropagation, gradient descent, and multilayer perceptrons.",
                skills.get("Deep Learning"), "INTERMEDIATE", "3Blue1Brown", "18:48", 19, "14M views");
        saveVideo("bZQun8Y4L2A", "State of GPT: Large Language Models Explained",
                "Andrej Karpathy details tokenizer internals, pre-training, fine-tuning, RLHF, and thinking models.",
                skills.get("Prompt Engineering & LLMs"), "INTERMEDIATE", "Andrej Karpathy", "42:01", 42, "1.9M views");

        // SQL & Databases
        saveVideo("HXV3zeRR3h4", "SQL Tutorial - Full Database Course for Beginners",
                "Master SQL queries, table schemas, aggregate operations, nested subqueries, and relational schema normalization.",
                skills.get("SQL"), "BEGINNER", "freeCodeCamp.org", "4:20:00", 260, "16M views");
        saveVideo("qw--VYLpxG4", "PostgreSQL Crash Course - Relational Architecture",
                "PostgreSQL setup, indexes, constraints, foreign keys, window functions, and query optimization.",
                skills.get("PostgreSQL"), "INTERMEDIATE", "Traversy Media", "45:10", 45, "750K views");

        // Cloud & DevOps
        saveVideo("3c-iBn73dDE", "Docker Tutorial for Beginners - Full Course Hands-On",
                "Containerization fundamentals, Dockerfiles, images, containers, networks, volumes, and Docker Compose.",
                skills.get("Docker"), "BEGINNER", "TechWorld with Nana", "3:10:48", 190, "4.2M views");
        saveVideo("m8Icp_Cid5o", "System Design Interview - Complete Engineering Guide",
                "Scalability, load balancing, caching tiers, message queues, horizontal partitioning, and CAP theorem.",
                skills.get("System Design"), "ADVANCED", "NeetCode", "1:15:00", 75, "890K views");
    }

    private void saveVideo(String videoId, String title, String desc, Skill skill, String diff, String channel, String duration, int mins, String views) {
        if (skill == null) return;
        youTubeVideoRepository.save(YouTubeVideo.builder()
                .videoId(videoId)
                .title(title)
                .description(desc)
                .skill(skill)
                .thumbnailUrl("https://img.youtube.com/vi/" + videoId + "/hqdefault.jpg")
                .channelTitle(channel)
                .duration(duration)
                .estimatedMinutes(mins)
                .difficulty(diff)
                .category(skill.getCategory())
                .viewCount(views)
                .active(true)
                .build());
    }

    private void addCareerSkill(Career career, Skill skill, double proficiency, double weight) {
        if (career == null || skill == null) return;
        careerSkillRepository.save(CareerSkill.builder()
            .career(career)
            .skill(skill)
            .requiredProficiency(BigDecimal.valueOf(proficiency))
            .importanceWeight(BigDecimal.valueOf(weight))
            .build());
    }

    private void createResource(String title, String desc, Skill skill, String difficulty, int minutes, String contentType, String externalUrl) {
        if (skill == null) return;
        learningResourceRepository.save(LearningResource.builder()
            .title(title)
            .description(desc)
            .skill(skill)
            .difficulty(difficulty)
            .contentType(contentType != null ? contentType : "ARTICLE")
            .contentBody("Comprehensive guide on " + title + ". Complete the exercises and quiz to verify mastery.")
            .externalUrl(externalUrl)
            .estimatedMinutes(minutes)
            .active(true)
            .build());
    }
}
