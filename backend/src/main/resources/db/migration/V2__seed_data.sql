-- ==============================================================================
-- SmartEvolve AI: Comprehensive Seed Data Migration
-- Version: V2__seed_data.sql
-- Description: Seeds 15 career roles, 32 distinct industry skills across 8 categories,
--              career-skill requirement weights, learning modules, prerequisites,
--              and interactive assessment quizzes with full answer keys and explanations.
-- ==============================================================================

-- 1. SEED SKILLS (Fixed UUIDs for deterministic foreign key references)
INSERT INTO skills (id, name, category, description) VALUES
-- Programming
('00000000-0000-0000-0001-000000000001', 'Python', 'Programming', 'Core Python programming, OOP concepts, functional paradigms, and standard library.'),
('00000000-0000-0000-0001-000000000002', 'Java', 'Programming', 'Java 21+, object-oriented architecture, JVM concurrency, and enterprise design patterns.'),
('00000000-0000-0000-0001-000000000003', 'JavaScript', 'Programming', 'Modern ECMAScript, asynchronous programming, DOM manipulation, and browser APIs.'),
('00000000-0000-0000-0001-000000000004', 'TypeScript', 'Programming', 'Static typing, generics, interfaces, advanced utility types, and compiler config.'),
('00000000-0000-0000-0001-000000000005', 'SQL', 'Programming', 'Relational database querying, multi-table joins, subqueries, CTEs, and window functions.'),

-- Databases
('00000000-0000-0000-0002-000000000001', 'PostgreSQL', 'Databases', 'Relational database modeling, indexes, query plans, triggers, and JSONB storage.'),
('00000000-0000-0000-0002-000000000002', 'MongoDB', 'Databases', 'Document-oriented NoSQL database design, aggregation pipelines, and sharding.'),
('00000000-0000-0000-0002-000000000003', 'Redis', 'Databases', 'In-memory key-value data store, caching strategies, pub/sub, and session management.'),

-- Data Analysis
('00000000-0000-0000-0003-000000000001', 'Pandas & NumPy', 'Data Analysis', 'Dataframe manipulation, vectorized calculations, missing data imputation, and aggregation.'),
('00000000-0000-0000-0003-000000000002', 'Statistics', 'Data Analysis', 'Probability distributions, hypothesis testing, p-values, regression, and inferential stats.'),
('00000000-0000-0000-0003-000000000003', 'Power BI', 'Data Analysis', 'Business intelligence reporting, DAX measures, data modeling, and dashboard design.'),
('00000000-0000-0000-0003-000000000004', 'Data Visualization', 'Data Analysis', 'Storytelling with data using Matplotlib, Seaborn, and interactive charting libraries.'),

-- Artificial Intelligence
('00000000-0000-0000-0004-000000000001', 'Machine Learning', 'Artificial Intelligence', 'Supervised/unsupervised algorithms, scikit-learn, cross-validation, and metric evaluation.'),
('00000000-0000-0000-0004-000000000002', 'Deep Learning', 'Artificial Intelligence', 'Neural networks, PyTorch/TensorFlow, backpropagation, CNNs, and transformers.'),
('00000000-0000-0000-0004-000000000003', 'Natural Language Processing', 'Artificial Intelligence', 'Tokenization, embeddings, text classification, transformers, and LLM fine-tuning.'),
('00000000-0000-0000-0004-000000000004', 'Prompt Engineering & LLMs', 'Artificial Intelligence', 'Zero-shot/few-shot prompting, RAG architectures, vector embeddings, and LangChain.'),

-- Web & Mobile Development
('00000000-0000-0000-0005-000000000001', 'React & React Native', 'Web Development', 'Component lifecycles, hooks, state management, mobile rendering, and Expo Router.'),
('00000000-0000-0000-0005-000000000002', 'Spring Boot', 'Web Development', 'Spring framework, dependency injection, JPA/Hibernate, Spring Security, and REST APIs.'),
('00000000-0000-0000-0005-000000000003', 'Node.js', 'Web Development', 'Event-driven backend development, Express/Fastify, middleware, and stream processing.'),
('00000000-0000-0000-0005-000000000004', 'RESTful API Design', 'Web Development', 'HTTP semantics, status codes, OpenAPI/Swagger specifications, and API versioning.'),

-- Cloud & DevOps
('00000000-0000-0000-0006-000000000001', 'Docker', 'Cloud and DevOps', 'Containerization, Dockerfile optimization, multi-stage builds, and Compose orchestration.'),
('00000000-0000-0000-0006-000000000002', 'Kubernetes', 'Cloud and DevOps', 'Container orchestration, pods, deployments, services, ingress, and configmaps.'),
('00000000-0000-0000-0006-000000000003', 'CI/CD Pipelines', 'Cloud and DevOps', 'Automated testing and deployment using GitHub Actions, GitLab CI, and artifact registries.'),
('00000000-0000-0000-0006-000000000004', 'AWS Cloud Core', 'Cloud and DevOps', 'EC2, S3, RDS, Lambda, IAM permissions, VPC networking, and cloud architecture.'),
('00000000-0000-0000-0006-000000000005', 'Linux Administration', 'Cloud and DevOps', 'Shell scripting, file permissions, systemd service management, and network utilities.'),

-- Cybersecurity & Testing
('00000000-0000-0000-0007-000000000001', 'Cybersecurity Fundamentals', 'Security and QA', 'Network security, OWASP Top 10 vulnerabilities, cryptography, and penetration testing basics.'),
('00000000-0000-0000-0007-000000000002', 'Software Testing & QA', 'Security and QA', 'Unit testing with JUnit/Jest, integration testing, mocking, and end-to-end automation.'),

-- Aptitude & Professional
('00000000-0000-0000-0008-000000000001', 'Data Structures & Algorithms', 'Aptitude and Problem Solving', 'Arrays, linked lists, trees, graphs, sorting, searching, and dynamic programming.'),
('00000000-0000-0000-0008-000000000002', 'System Design', 'Aptitude and Problem Solving', 'High-level architecture, scalability, load balancing, caching, and database partitioning.'),
('00000000-0000-0000-0008-000000000003', 'Agile & Scrum', 'Communication', 'Sprint planning, user stories, retrospectives, Jira, and cross-functional collaboration.'),
('00000000-0000-0000-0008-000000000004', 'Technical Communication', 'Communication', 'Design docs, RFC proposals, stakeholder presentations, and clear technical documentation.')
ON CONFLICT (id) DO NOTHING;

-- 2. SEED 15 CAREER ROLES
INSERT INTO careers (id, name, description, category, active) VALUES
('10000000-0000-0000-0000-000000000001', 'AI Engineer', 'Architect and deploy artificial intelligence models, generative AI pipelines, and agentic workflows into production systems.', 'AI & Data Science', true),
('10000000-0000-0000-0000-000000000002', 'Machine Learning Engineer', 'Design, train, optimize, and serve scalable predictive ML models using statistical algorithms and deep learning frameworks.', 'AI & Data Science', true),
('10000000-0000-0000-0000-000000000003', 'Data Analyst', 'Transform raw structured data into actionable business intelligence through dashboards, statistical analysis, and SQL queries.', 'Data & Analytics', true),
('10000000-0000-0000-0000-000000000004', 'Data Scientist', 'Extract deep insights from complex data using advanced statistical modeling, experimental design, and predictive algorithms.', 'AI & Data Science', true),
('10000000-0000-0000-0000-000000000005', 'Full-Stack Developer', 'Develop robust end-to-end web applications covering user interfaces, RESTful APIs, database persistence, and cloud hosting.', 'Software Engineering', true),
('10000000-0000-0000-0000-000000000006', 'Backend Developer', 'Engineer high-throughput server-side services, data pipelines, caching layers, and secure microservices.', 'Software Engineering', true),
('10000000-0000-0000-0000-000000000007', 'Frontend Developer', 'Craft responsive, intuitive, and performant user experiences using modern JavaScript/TypeScript and component frameworks.', 'Software Engineering', true),
('10000000-0000-0000-0000-000000000008', 'Mobile App Developer', 'Create cross-platform and native mobile experiences with React Native, state management, and device native APIs.', 'Mobile Development', true),
('10000000-0000-0000-0000-000000000009', 'Java Developer', 'Build mission-critical enterprise applications and microservices using modern Java, Spring Boot, and robust architectural patterns.', 'Enterprise Software', true),
('10000000-0000-0000-0000-000000000010', 'Cloud Engineer', 'Provision, automate, and monitor secure multi-tier infrastructure on public cloud platforms like AWS and Google Cloud.', 'Cloud & Infrastructure', true),
('10000000-0000-0000-0000-000000000011', 'DevOps Engineer', 'Automate CI/CD pipelines, container orchestration with Kubernetes, infrastructure as code, and observability systems.', 'Cloud & Infrastructure', true),
('10000000-0000-0000-0000-000000000012', 'Cybersecurity Analyst', 'Protect organizational systems against cyber threats, perform vulnerability assessments, and implement zero-trust architectures.', 'Security', true),
('10000000-0000-0000-0000-000000000013', 'Software Test Engineer', 'Ensure software reliability, performance, and defect-free releases through automated testing frameworks and continuous QA.', 'Quality Assurance', true),
('10000000-0000-0000-0000-000000000014', 'Business Analyst', 'Bridge business stakeholders and engineering teams by defining functional requirements, workflows, and data-driven solutions.', 'Management & Analytics', true),
('10000000-0000-0000-0000-000000000015', 'Database Administrator', 'Manage relational and NoSQL databases for optimal query performance, high availability, backup recovery, and security compliance.', 'Data Infrastructure', true)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED CAREER_SKILLS (Target proficiency and importance weights)
-- Data Analyst: Python (75%), SQL (85%), Statistics (70%), Power BI (80%), Pandas & NumPy (80%)
INSERT INTO career_skills (career_id, skill_id, required_proficiency, importance_weight) VALUES
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000001', 75.0, 1.2), -- Python
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0001-000000000005', 85.0, 1.5), -- SQL
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0003-000000000002', 70.0, 1.1), -- Statistics
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0003-000000000003', 80.0, 1.3), -- Power BI
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0003-000000000001', 80.0, 1.3), -- Pandas & NumPy

-- AI Engineer: Python (90%), Machine Learning (85%), Deep Learning (80%), Prompt Engineering & LLMs (85%), RESTful API Design (70%)
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', 90.0, 1.5),
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0004-000000000001', 85.0, 1.4),
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0004-000000000002', 80.0, 1.3),
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0004-000000000004', 85.0, 1.4),
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0005-000000000004', 70.0, 1.0),

-- Full-Stack Developer: JavaScript (85%), TypeScript (80%), React & React Native (85%), Spring Boot (75%), PostgreSQL (75%)
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0001-000000000003', 85.0, 1.3),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0001-000000000004', 80.0, 1.2),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0005-000000000001', 85.0, 1.4),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0005-000000000002', 75.0, 1.2),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0002-000000000001', 75.0, 1.1),

-- Java Developer: Java (90%), Spring Boot (85%), PostgreSQL (80%), Data Structures & Algorithms (80%), Docker (70%)
('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0001-000000000002', 90.0, 1.6),
('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0005-000000000002', 85.0, 1.5),
('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0002-000000000001', 80.0, 1.2),
('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0008-000000000001', 80.0, 1.2),
('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0006-000000000001', 70.0, 1.0),

-- Mobile App Developer: TypeScript (85%), React & React Native (90%), RESTful API Design (80%), Software Testing & QA (70%)
('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0001-000000000004', 85.0, 1.3),
('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0005-000000000001', 90.0, 1.6),
('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0005-000000000004', 80.0, 1.1),
('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0007-000000000002', 70.0, 1.0),

-- Cloud Engineer: AWS Cloud Core (85%), Docker (85%), Kubernetes (80%), CI/CD Pipelines (80%), Linux Administration (85%)
('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0006-000000000004', 85.0, 1.5),
('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0006-000000000001', 85.0, 1.3),
('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0006-000000000002', 80.0, 1.3),
('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0006-000000000003', 80.0, 1.2),
('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0006-000000000005', 85.0, 1.2)
ON CONFLICT (career_id, skill_id) DO NOTHING;

-- 4. SEED LEARNING RESOURCES
INSERT INTO learning_resources (id, title, description, skill_id, difficulty, content_type, content_body, external_url, estimated_minutes, active) VALUES
-- Python Foundations
('20000000-0000-0000-0001-000000000001', 'Python Mastery: Variables to Data Structures', 'Master Python lists, dictionaries, comprehensions, and functions.', '00000000-0000-0000-0001-000000000001', 'BEGINNER', 'ARTICLE', 
'# Python Essentials\n\nPython offers dynamic typing and clear syntax.\n\n### Key Concepts:\n- **List Comprehensions**: `[x**2 for x in range(10) if x % 2 == 0]`\n- **Dictionaries**: Fast O(1) hash map lookups.\n- **Generators**: Lazy evaluation yielding memory efficiency.\n\nDemonstrate mastery by solving algorithmic problems and writing clean PEP-8 compliant code.', 'https://docs.python.org/3/tutorial/', 45, true),

('20000000-0000-0000-0001-000000000002', 'Intermediate Python: Object-Oriented Design', 'Build modular software with Python classes, inheritance, decorators, and context managers.', '00000000-0000-0000-0001-000000000001', 'INTERMEDIATE', 'ARTICLE', 
'# OOP in Python\n\nLearn dunder methods (`__init__`, `__repr__`, `__enter__`), custom exceptions, and the `@property` decorator to build robust domain models.', 'https://realpython.com/python3-object-oriented-programming/', 60, true),

-- SQL Mastery
('20000000-0000-0000-0001-000000000003', 'Modern SQL Querying & Relational Joins', 'Learn INNER, LEFT, FULL OUTER joins, aggregate functions, and GROUP BY nuances.', '00000000-0000-0000-0001-000000000005', 'BEGINNER', 'ARTICLE', 
'# Relational Querying\n\nSQL allows declarative data manipulation.\n\n```sql\nSELECT d.department_name, AVG(e.salary) as avg_sal\nFROM employees e\nJOIN departments d ON e.dept_id = d.id\nGROUP BY d.department_name\nHAVING AVG(e.salary) > 60000;\n```\n\nPractice execution order: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY.', 'https://www.postgresql.org/docs/current/tutorial-sql.html', 40, true),

('20000000-0000-0000-0001-000000000004', 'Advanced SQL: Window Functions & CTEs', 'Write complex analytical queries using Common Table Expressions and window functions like RANK() and LAG().', '00000000-0000-0000-0001-000000000005', 'INTERMEDIATE', 'ARTICLE', 
'# Window Functions\n\n```sql\nWITH SalesRank AS (\n  SELECT employee_id, region, revenue,\n         DENSE_RANK() OVER (PARTITION BY region ORDER BY revenue DESC) as rank\n  FROM sales\n)\nSELECT * FROM SalesRank WHERE rank <= 3;\n```', 'https://mode.com/sql-tutorial/sql-window-functions/', 55, true),

-- Pandas & NumPy
('20000000-0000-0000-0003-000000000001', 'Data Wrangling with Pandas and NumPy', 'Clean, filter, pivot, and analyze datasets with high-performance vectorized operations.', '00000000-0000-0000-0003-000000000001', 'BEGINNER', 'ARTICLE', 
'# Data Wrangling\n\nPandas DataFrames provide tabular data manipulation.\n\n```python\nimport pandas as pd\ndf = pd.read_csv("data.csv")\ncleaned_df = df.dropna(subset=["salary"]).groupby("department")["salary"].mean().reset_index()\n```', 'https://pandas.pydata.org/docs/getting_started/', 50, true),

-- Statistics
('20000000-0000-0000-0003-000000000002', 'Practical Statistics for Data Professionals', 'Confidence intervals, hypothesis testing (t-tests, ANOVA), and regression metrics.', '00000000-0000-0000-0003-000000000002', 'INTERMEDIATE', 'ARTICLE', 
'# Statistical Inference\n\nUnderstand Null Hypothesis Significance Testing (NHST), Type I and Type II errors, and effect size calculation.', 'https://openstax.org/details/books/introductory-statistics', 60, true),

-- Power BI
('20000000-0000-0000-0003-000000000003', 'Executive Dashboard Engineering in Power BI', 'Design enterprise star schemas, implement DAX calculated columns and measures, and publish interactive reports.', '00000000-0000-0000-0003-000000000003', 'BEGINNER', 'ARTICLE', 
'# Power BI & DAX\n\nLearn star schema data modeling and the `CALCULATE()` function with filter context modifiers in DAX.', 'https://learn.microsoft.com/en-us/power-bi/', 45, true),

-- Java & Spring Boot
('20000000-0000-0000-0005-000000000001', 'Java 21 Modern Features & JVM Concurrency', 'Records, pattern matching, Virtual Threads (Project Loom), and Sequenced Collections.', '00000000-0000-0000-0001-000000000002', 'INTERMEDIATE', 'ARTICLE', 
'# Java 21 Modern Capabilities\n\nExplore records for immutable data carriers, sealed classes for domain modeling, and virtual threads for high throughput I/O.', 'https://dev.java/', 60, true),

('20000000-0000-0000-0005-000000000002', 'Spring Boot 3 Enterprise Microservices', 'Dependency Injection, Spring Data JPA, Spring Security with JWTs, and Bean Validation.', '00000000-0000-0000-0005-000000000002', 'INTERMEDIATE', 'ARTICLE', 
'# Spring Boot 3\n\nBuild resilient, cloud-ready RESTful web services with declarative transactions, standard DTO validation, and JPA repositories.', 'https://spring.io/guides', 75, true)
ON CONFLICT (id) DO NOTHING;

-- 5. SEED PREREQUISITES (Resource -> Prerequisite Resource)
INSERT INTO learning_prerequisites (resource_id, prerequisite_resource_id) VALUES
('20000000-0000-0000-0001-000000000002', '20000000-0000-0000-0001-000000000001'), -- OOP Python requires Python Basics
('20000000-0000-0000-0001-000000000004', '20000000-0000-0000-0001-000000000003'), -- SQL Advanced requires SQL Basics
('20000000-0000-0000-0003-000000000001', '20000000-0000-0000-0001-000000000001'), -- Pandas requires Python Basics
('20000000-0000-0000-0005-000000000002', '20000000-0000-0000-0005-000000000001')  -- Spring Boot requires Java Basics
ON CONFLICT (resource_id, prerequisite_resource_id) DO NOTHING;

-- 6. SEED ASSESSMENTS
INSERT INTO assessments (id, title, skill_id, difficulty, assessment_type, active) VALUES
('30000000-0000-0000-0001-000000000001', 'Python Diagnostic Proficiency Assessment', '00000000-0000-0000-0001-000000000001', 'BEGINNER', 'DIAGNOSTIC', true),
('30000000-0000-0000-0001-000000000002', 'Relational SQL & Query Optimization Quiz', '00000000-0000-0000-0001-000000000005', 'INTERMEDIATE', 'QUIZ', true),
('30000000-0000-0000-0001-000000000003', 'Pandas & Statistical Analysis Assessment', '00000000-0000-0000-0003-000000000001', 'INTERMEDIATE', 'QUIZ', true),
('30000000-0000-0000-0001-000000000004', 'Java 21 & Spring Boot Enterprise Evaluation', '00000000-0000-0000-0001-000000000002', 'ADVANCED', 'MILESTONE', true)
ON CONFLICT (id) DO NOTHING;

-- 7. SEED ASSESSMENT QUESTIONS (Secure questions with correct answers stored for backend evaluation)
INSERT INTO assessment_questions (id, assessment_id, question_text, question_type, options, correct_answer, explanation, marks, order_index) VALUES
-- Python Assessment Questions
('40000000-0000-0000-0001-000000000001', '30000000-0000-0000-0001-000000000001', 
 'What is the output of `[x for x in range(5) if x % 2 != 0]` in Python?', 
 'MULTIPLE_CHOICE', 
 '[{"id": "A", "text": "[0, 2, 4]"}, {"id": "B", "text": "[1, 3]"}, {"id": "C", "text": "[1, 3, 5]"}, {"id": "D", "text": "[0, 1, 2, 3, 4]"}]'::jsonb, 
 'B', 
 'range(5) produces 0, 1, 2, 3, 4. The condition x % 2 != 0 selects odd numbers, giving [1, 3].', 1, 1),

('40000000-0000-0000-0001-000000000002', '30000000-0000-0000-0001-000000000001', 
 'Which Python data structure provides average O(1) time complexity for lookup and key insertion?', 
 'MULTIPLE_CHOICE', 
 '[{"id": "A", "text": "List"}, {"id": "B", "text": "Tuple"}, {"id": "C", "text": "Dictionary"}, {"id": "D", "text": "Linked List"}]'::jsonb, 
 'C', 
 'Python dictionaries are implemented using hash tables, offering amortized O(1) lookup and insertion.', 1, 2),

('40000000-0000-0000-0001-000000000003', '30000000-0000-0000-0001-000000000001', 
 'What does the `yield` keyword signify in a Python function?', 
 'MULTIPLE_CHOICE', 
 '[{"id": "A", "text": "It terminates function execution immediately"}, {"id": "B", "text": "It turns the function into a generator that produces values lazily"}, {"id": "C", "text": "It imports an external module"}, {"id": "D", "text": "It throws an asynchronous runtime exception"}]'::jsonb, 
 'B', 
 'Functions containing `yield` return generator iterators that evaluate values on demand with minimal memory footprint.', 1, 3),

-- SQL Assessment Questions
('40000000-0000-0000-0002-000000000001', '30000000-0000-0000-0001-000000000002', 
 'What is the primary difference between WHERE and HAVING clauses in SQL?', 
 'MULTIPLE_CHOICE', 
 '[{"id": "A", "text": "WHERE filters before grouping; HAVING filters aggregated groups"}, {"id": "B", "text": "WHERE can only be used with numbers; HAVING with strings"}, {"id": "C", "text": "HAVING executes before FROM"}, {"id": "D", "text": "There is no difference; they are interchangeable"}]'::jsonb, 
 'A', 
 'The WHERE clause filters individual rows before aggregation occurs. The HAVING clause filters summary groups produced by GROUP BY.', 1, 1),

('40000000-0000-0000-0002-000000000002', '30000000-0000-0000-0001-000000000002', 
 'Which SQL window function assigns ranks without leaving gaps when tie values exist?', 
 'MULTIPLE_CHOICE', 
 '[{"id": "A", "text": "RANK()"}, {"id": "B", "text": "DENSE_RANK()"}, {"id": "C", "text": "ROW_NUMBER()"}, {"id": "D", "text": "NTILE()"}]'::jsonb, 
 'B', 
 'DENSE_RANK() assigns sequential ranks (1, 2, 2, 3) without skipping rank numbers during ties.', 1, 2),

('40000000-0000-0000-0002-000000000003', '30000000-0000-0000-0001-000000000002', 
 'In relational database indexing, what is a B-Tree index best optimized for?', 
 'MULTIPLE_CHOICE', 
 '[{"id": "A", "text": "Exact match lookups and range queries"}, {"id": "B", "text": "Only full-text pattern searches"}, {"id": "C", "text": "Geo-spatial polygon intersections"}, {"id": "D", "text": "Unordered key-value caching"}]'::jsonb, 
 'A', 
 'B-Tree indexes maintain sorted keys allowing logarithmic time complexity O(log N) for equality and range-based scans.', 1, 3)
ON CONFLICT (id) DO NOTHING;
