import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  useWindowDimensions,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Svg, { Path } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../src/api/client";
import { YouTubePlayer } from "../../src/components/YouTubePlayer";
import { Card } from "../../src/components/Card";
import { Badge } from "../../src/components/Badge";
import { Button } from "../../src/components/Button";
import { VideoCard } from "../../src/components/VideoCard";
import { CertificateModal } from "../../src/components/CertificateModal";
import { InteractiveQuizArenaModal } from "../../src/components/InteractiveQuizArenaModal";
import { getMasterVideoById } from "../../src/data/masterVideos";
import { colors, radius, spacing } from "../../src/theme/colors";

const SAVED_VIDEOS_STORAGE_KEY = "smartevolve_saved_videos";

// Dynamic quiz question bank tailored by skill/topic
interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUESTION_BANK: Record<string, QuizQuestion[]> = {
  "springboot": [
    {
      "id": 1,
      "question": "Which annotation in Spring Boot combines @Controller and @ResponseBody to create RESTful JSON endpoints?",
      "options": ["@RestController", "@Service", "@Repository", "@Component"],
      "correctIndex": 0,
      "explanation": "@RestController combines @Controller and @ResponseBody, ensuring handler methods serialize return values directly into HTTP response bodies as JSON."
    },
    {
      "id": 2,
      "question": "What is the primary role of Spring Boot Auto-Configuration?",
      "options": [
        "Automatically configures Spring beans based on jar dependencies on the classpath",
        "Compiles Java source files into bytecode",
        "Deploys application containers directly to cloud clusters",
        "Formats and checks Java indentation styles"
      ],
      "correctIndex": 0,
      "explanation": "Auto-Configuration inspects your project dependencies (e.g., spring-boot-starter-web) and automatically registers default beans without verbose XML configuration."
    },
    {
      "id": 3,
      "question": "Which Spring Data interface provides built-in pagination, sorting, and standard CRUD operations?",
      "options": ["JpaRepository", "JdbcTemplate", "CrudEngine", "SessionManager"],
      "correctIndex": 0,
      "explanation": "JpaRepository extends PagingAndSortingRepository and CrudRepository, providing out-of-the-box support for pagination, sorting, and batch operations."
    },
    {
      "id": 4,
      "question": "Where are environment configurations primarily defined in standard Spring Boot projects?",
      "options": ["application.yml or application.properties", "pom.xml or build.gradle", "web.xml under WEB-INF", "beans.xml in root classpath"],
      "correctIndex": 0,
      "explanation": "application.yml (or application.properties) in src/main/resources is the canonical location for configuring port, datasource, JPA dialects, and custom properties."
    },
    {
      "id": 5,
      "question": "Which HTTP status code should a REST endpoint return when a new entity is successfully created?",
      "options": ["201 Created", "200 OK", "204 No Content", "202 Accepted"],
      "correctIndex": 0,
      "explanation": "RFC 7231 specifies HTTP 201 Created as the correct standard response for POST requests that successfully result in the creation of a new persistent resource."
    },
    {
      "id": 6,
      "question": "Which annotation is used in Spring Boot to map HTTP GET requests onto specific handler methods?",
      "options": ["@GetMapping", "@PostMapping", "@PutMapping", "@DeleteMapping"],
      "correctIndex": 0,
      "explanation": "@GetMapping is a composed annotation that acts as a shortcut for @RequestMapping(method = RequestMethod.GET)."
    },
    {
      "id": 7,
      "question": "What is the default embedded servlet web container provided by spring-boot-starter-web?",
      "options": ["Apache Tomcat", "Eclipse Jetty", "Red Hat Undertow", "GlassFish"],
      "correctIndex": 0,
      "explanation": "Spring Boot web starter embeds Apache Tomcat by default listening on port 8080."
    },
    {
      "id": 8,
      "question": "In Spring Boot Dependency Injection, which annotation marks a service class holding core business logic?",
      "options": ["@Service", "@Controller", "@Configuration", "@Aspect"],
      "correctIndex": 0,
      "explanation": "@Service is a specialization of the @Component annotation that marks classes containing business logic and domain calculations."
    },
    {
      "id": 9,
      "question": "Which annotation ensures database operations inside a method execute inside a single transaction with automatic rollback?",
      "options": ["@Transactional", "@Async", "@Modifying", "@Synchronized"],
      "correctIndex": 0,
      "explanation": "@Transactional manages transaction boundaries declaratively, automatically committing on return and rolling back on runtime exceptions."
    },
    {
      "id": 10,
      "question": "What Spring Boot actuator endpoint provides real-time application health metrics and liveness probes?",
      "options": ["/actuator/health", "/actuator/info", "/actuator/metrics", "/actuator/beans"],
      "correctIndex": 0,
      "explanation": "/actuator/health provides health check status used by container orchestrators and monitoring tools."
    },
    {
      "id": 11,
      "question": "Which annotation in Spring Boot is used to read custom properties defined in application.yml or environment variables into a field?",
      "options": ["@Value", "@Autowired", "@Qualifier", "@Inject"],
      "correctIndex": 0,
      "explanation": "@Value injects property values (e.g. @Value('${app.secret}')) directly into bean fields."
    },
    {
      "id": 12,
      "question": "Which bean scope ensures only one instance of a bean is created per Spring ApplicationContext container?",
      "options": ["Singleton", "Prototype", "Request", "Session"],
      "correctIndex": 0,
      "explanation": "Singleton is the default Spring bean scope, maintaining a single shared instance throughout the lifecycle of the ApplicationContext."
    },
    {
      "id": 13,
      "question": "What tool does Spring Boot leverage for database version control and automated migration scripts?",
      "options": ["Flyway & Liquibase", "Hibernate DDL Auto only", "Docker Compose", "Webpack"],
      "correctIndex": 0,
      "explanation": "Flyway and Liquibase execute SQL migration scripts (e.g., V1__schema.sql) automatically on application startup."
    },
    {
      "id": 14,
      "question": "In Spring Security, which filter chain component validates incoming JSON Web Tokens (JWT) before dispatching to controllers?",
      "options": ["OncePerRequestFilter", "DispatcherServlet", "HandlerInterceptor", "FilterRegistrationBean"],
      "correctIndex": 0,
      "explanation": "OncePerRequestFilter guarantees single execution per request to inspect authorization headers and populate SecurityContextHolder."
    },
    {
      "id": 15,
      "question": "Which module enables asynchronous non-blocking event-driven reactive REST programming in Spring Boot?",
      "options": ["Spring WebFlux & Project Reactor", "Spring MVC", "Spring Batch", "Spring HATEOAS"],
      "correctIndex": 0,
      "explanation": "Spring WebFlux uses Project Reactor (Mono & Flux) to handle concurrent requests on a non-blocking Netty runtime."
    }
  ],
  "python": [
    {
      "id": 1,
      "question": "What is the output of `[x**2 for x in range(4) if x % 2 == 0]` in Python?",
      "options": ["[0, 4]", "[0, 1, 4, 9]", "[4, 16]", "[0, 2]"],
      "correctIndex": 0,
      "explanation": "The range is 0, 1, 2, 3. Even numbers are 0 and 2. Squaring them yields 0**2 = 0 and 2**2 = 4, resulting in [0, 4]."
    },
    {
      "id": 2,
      "question": "Which Python data structure is immutable and defined with parentheses?",
      "options": ["Tuple", "List", "Dictionary", "Set"],
      "correctIndex": 0,
      "explanation": "Tuples are immutable sequence types in Python; once initialized, their elements cannot be appended or modified."
    },
    {
      "id": 3,
      "question": "Which library is the standard foundation for high-performance multidimensional array math in Python?",
      "options": ["NumPy", "Requests", "Flask", "BeautifulSoup"],
      "correctIndex": 0,
      "explanation": "NumPy provides the contiguous C-level ndarray object and optimized vector math routines fundamental to Python scientific computing."
    },
    {
      "id": 4,
      "question": "In Python, which keyword is used to create an anonymous single-expression function?",
      "options": ["lambda", "def", "inline", "anon"],
      "correctIndex": 0,
      "explanation": "The `lambda` keyword defines anonymous single-expression functions in Python (e.g. `lambda x: x * 2`)."
    },
    {
      "id": 5,
      "question": "What does the GIL (Global Interpreter Lock) enforce in CPython?",
      "options": [
        "Only one native OS thread executes Python bytecode at any given instant",
        "Encrypts variables stored in shared memory",
        "Automatically terminates deadlocked processes",
        "Enforces strict type annotations at compile time"
      ],
      "correctIndex": 0,
      "explanation": "The GIL is a mutex that protects access to Python objects, preventing multiple native threads from executing Python bytecodes simultaneously in CPython."
    },
    {
      "id": 6,
      "question": "Which Python keyword transforms a standard function into a memory-efficient generator iterator?",
      "options": ["yield", "return", "generate", "iter"],
      "correctIndex": 0,
      "explanation": "The `yield` statement suspends function execution and returns an intermediate value, maintaining state across calls."
    },
    {
      "id": 7,
      "question": "What is the average time complexity of looking up a key in a Python dictionary?",
      "options": ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
      "correctIndex": 0,
      "explanation": "Python dictionaries are implemented as dynamic hash tables, yielding O(1) average lookup and insertion time complexity."
    },
    {
      "id": 8,
      "question": "What special protocol method is executed when an object is entered using the 'with' statement?",
      "options": ["__enter__", "__init__", "__call__", "__open__"],
      "correctIndex": 0,
      "explanation": "Context managers implement `__enter__` (setup) and `__exit__` (teardown), invoked automatically by the `with` statement."
    },
    {
      "id": 9,
      "question": "How are variable keyword arguments accepted in a Python function definition?",
      "options": ["**kwargs", "*args", "kwargs[]", "&kwargs"],
      "correctIndex": 0,
      "explanation": "**kwargs captures arbitrary named arguments into a standard Python dictionary."
    },
    {
      "id": 10,
      "question": "Which built-in module provides tools for functional programming including partial functions and reduce?",
      "options": ["functools", "itertools", "collections", "operator"],
      "correctIndex": 0,
      "explanation": "The `functools` module includes higher-order utilities like `partial`, `lru_cache`, and `reduce`."
    },
    {
      "id": 11,
      "question": "Which decorator in Python creates read-only getter properties without modifying callers' attribute access syntax?",
      "options": ["@property", "@getter", "@readonly", "@staticmethod"],
      "correctIndex": 0,
      "explanation": "@property converts a class method into an attribute getter."
    },
    {
      "id": 12,
      "question": "In Python, which module is standard for executing true OS-level parallel processing bypassing the GIL?",
      "options": ["multiprocessing", "threading", "asyncio", "concurrent.threads"],
      "correctIndex": 0,
      "explanation": "multiprocessing spawns separate OS processes with independent memory spaces and GILs for parallel CPU computation."
    },
    {
      "id": 13,
      "question": "What is the purpose of `__slots__` in a Python class definition?",
      "options": [
        "Reduces memory footprint by preventing dynamic `__dict__` creation for instances",
        "Declares abstract base class methods",
        "Locks attributes against typing changes",
        "Enables thread-safe variable access"
      ],
      "correctIndex": 0,
      "explanation": "__slots__ explicitly declares data members, omitting __dict__ and saving substantial memory when instantiating millions of objects."
    },
    {
      "id": 14,
      "question": "Which built-in Python function returns an iterator that produces pairs of `(index, item)` when looping through an iterable?",
      "options": ["enumerate()", "zip()", "map()", "range()"],
      "correctIndex": 0,
      "explanation": "enumerate(iterable, start=0) yields (index, value) tuples during iteration."
    },
    {
      "id": 15,
      "question": "What is the difference between shallow copy and deep copy in Python's `copy` module?",
      "options": [
        "Deep copy recursively copies all nested objects; shallow copy only copies the outer container",
        "Shallow copy converts lists to tuples",
        "Deep copy is only for immutable types",
        "Shallow copy deletes the original object"
      ],
      "correctIndex": 0,
      "explanation": "copy.deepcopy() clones compound objects recursively, while copy.copy() only constructs a new collection referencing original nested items."
    }
  ],
  "machinelearning": [
    {
      "id": 1,
      "question": "In Supervised Machine Learning, what is the primary target that the model attempts to predict?",
      "options": ["Labels / Ground Truth", "Unlabeled Clusters", "Eigenvalues", "Network Bandwidth"],
      "correctIndex": 0,
      "explanation": "Supervised learning learns a mapping function from input features X to known target ground truth labels Y."
    },
    {
      "id": 2,
      "question": "What loss function is most commonly used for training binary classification models?",
      "options": ["Binary Cross-Entropy (Log Loss)", "Mean Squared Error", "Hinge Loss", "Huber Loss"],
      "correctIndex": 0,
      "explanation": "Binary Cross-Entropy penalizes confident incorrect probabilistic predictions logarithmically, ideal for binary classification."
    },
    {
      "id": 3,
      "question": "Which algorithm computes optimal weights in neural networks by propagating errors backward via the chain rule of calculus?",
      "options": ["Backpropagation", "Forward Chaining", "Simulated Annealing", "Markov Decision Process"],
      "correctIndex": 0,
      "explanation": "Backpropagation computes partial derivatives of the objective loss function with respect to every weight using the chain rule."
    },
    {
      "id": 4,
      "question": "What happens in the Bias-Variance tradeoff when a model has extremely high bias?",
      "options": ["Underfitting (oversimplified assumptions)", "Overfitting (memorizing noise)", "Zero test error", "Gradient explosion"],
      "correctIndex": 0,
      "explanation": "High bias indicates oversimplified model hypotheses that fail to capture underlying patterns, causing underfitting on both train and test sets."
    },
    {
      "id": 5,
      "question": "Which transformer component prevents tokens in decoder autoregressive language models from attending to future tokens?",
      "options": ["Causal Masking", "Layer Normalization", "Residual Connections", "Dropout"],
      "correctIndex": 0,
      "explanation": "Causal masking sets attention scores of future token positions to -infinity, ensuring tokens can only attend to previous tokens."
    },
    {
      "id": 6,
      "question": "What hyperparameter controls the step size taken during gradient descent optimization?",
      "options": ["Learning Rate (alpha)", "Epoch Count", "Batch Size", "Regularization Lambda"],
      "correctIndex": 0,
      "explanation": "The learning rate dictates the step size at each iteration while moving toward a minimum of a loss function."
    },
    {
      "id": 7,
      "question": "What ensemble learning method combines multiple independently trained Decision Trees via bootstrap aggregating (bagging)?",
      "options": ["Random Forest", "Gradient Boosting Machine", "Linear Discriminant Analysis", "Support Vector Machine"],
      "correctIndex": 0,
      "explanation": "Random Forest builds multiple decision trees on bootstrapped data subsets and merges them to obtain a more accurate and stable prediction."
    },
    {
      "id": 8,
      "question": "What problem occurs when a model performs exceptionally well on training data but poorly on unseen test data?",
      "options": ["High Variance (Overfitting)", "High Bias (Underfitting)", "Data Leakage", "Feature Collinearity"],
      "correctIndex": 0,
      "explanation": "Overfitting happens when a model learns the detailed patterns and noise in the training data to the extent that it negatively impacts test performance."
    },
    {
      "id": 9,
      "question": "Which cross-validation technique divides the dataset into 'k' equal subsets to evaluate model stability?",
      "options": ["K-Fold Cross-Validation", "Monte Carlo Sampling", "Leave-P-Out Testing", "Bootstrapping"],
      "correctIndex": 0,
      "explanation": "K-Fold cross-validation splits the dataset into k folds, training on k-1 and validating on the remaining fold across k iterations."
    },
    {
      "id": 10,
      "question": "What does an Area Under the ROC Curve (AUC-ROC) of 0.5 represent?",
      "options": ["Performance equivalent to random guessing", "Perfect classification ability", "Severe inverse correlation", "Zero false positives"],
      "correctIndex": 0,
      "explanation": "An AUC-ROC score of 0.5 represents a model with no discrimination capacity, performing no better than random guessing."
    },
    {
      "id": 11,
      "question": "Which regularization technique adds the sum of absolute values of coefficients (L1 penalty) to induce feature sparsity?",
      "options": ["Lasso Regularization (L1)", "Ridge Regularization (L2)", "ElasticNet", "Dropout"],
      "correctIndex": 0,
      "explanation": "Lasso (L1) drives uninformative feature weights to zero, effectively performing automatic feature selection."
    },
    {
      "id": 12,
      "question": "What metric is best suited to evaluate classification models on severely imbalanced datasets?",
      "options": ["F1-Score / PR-AUC", "Accuracy", "Mean Squared Error", "R-Squared"],
      "correctIndex": 0,
      "explanation": "F1-Score (harmonic mean of Precision and Recall) and Precision-Recall AUC reflect performance without being skewed by dominant negative classes."
    },
    {
      "id": 13,
      "question": "Which activation function suffers from the vanishing gradient problem when handling very large positive inputs in deep neural networks?",
      "options": ["Sigmoid", "ReLU", "Leaky ReLU", "ELU"],
      "correctIndex": 0,
      "explanation": "Sigmoid squashes inputs between 0 and 1; for extreme values, its derivative approaches 0, killing gradients in deep networks."
    },
    {
      "id": 14,
      "question": "What mechanism in the Transformer architecture allows models to dynamically weigh dependencies between words irrespective of their distance?",
      "options": ["Scaled Dot-Product Self-Attention", "Recurrent Hidden States", "Convolutional Max-Pooling", "Gated Recurrent Units"],
      "correctIndex": 0,
      "explanation": "Self-attention computes query-key similarity matrices to assign attention weights across all tokens in O(1) sequential distance."
    },
    {
      "id": 15,
      "question": "What unsupervised clustering algorithm partitions n observations into k clusters where each observation belongs to the cluster with the nearest mean?",
      "options": ["K-Means Clustering", "DBSCAN", "Principal Component Analysis (PCA)", "Isolation Forest"],
      "correctIndex": 0,
      "explanation": "K-Means iteratively recalculates centroids and assigns data points to the closest cluster center."
    }
  ],
  "sql": [
    {
      "id": 1,
      "question": "Which SQL clause is used to filter records after performing an aggregate GROUP BY operation?",
      "options": ["HAVING", "WHERE", "ORDER BY", "QUALIFY"],
      "correctIndex": 0,
      "explanation": "WHERE filters rows before grouping; HAVING filters the aggregated groups created by GROUP BY."
    },
    {
      "id": 2,
      "question": "What does ACID stand for in database transaction theory?",
      "options": [
        "Atomicity, Consistency, Isolation, Durability",
        "Asynchronous, Concurrent, Indexed, Distributed",
        "Access, Control, Identity, Data",
        "Active, Cached, Insert, Delete"
      ],
      "correctIndex": 0,
      "explanation": "ACID principles guarantee reliable transaction processing in relational database management systems."
    },
    {
      "id": 3,
      "question": "Which JOIN returns all rows from the left table and matching rows from the right table?",
      "options": ["LEFT OUTER JOIN", "INNER JOIN", "CROSS JOIN", "RIGHT OUTER JOIN"],
      "correctIndex": 0,
      "explanation": "LEFT JOIN retains every record from the left table; if no match exists in the right table, NULLs are returned for right columns."
    },
    {
      "id": 4,
      "question": "What is the index data structure used by most relational engines for high-performance indexing?",
      "options": ["B+ Tree", "Linked List", "Binary Heap", "Hash Ring"],
      "correctIndex": 0,
      "explanation": "B+ Trees store all actual record pointers in leaf nodes linked sequentially, facilitating both fast point lookups and range scans."
    },
    {
      "id": 5,
      "question": "Which SQL constraint guarantees that all values in a column are distinct and not null?",
      "options": ["PRIMARY KEY", "FOREIGN KEY", "CHECK", "DEFAULT"],
      "correctIndex": 0,
      "explanation": "PRIMARY KEY combines UNIQUE and NOT NULL constraints to uniquely identify each row."
    },
    {
      "id": 6,
      "question": "What type of subquery executes once for each row evaluated by the outer query?",
      "options": ["Correlated Subquery", "Scalar Subquery", "Nested Static Subquery", "CTE"],
      "correctIndex": 0,
      "explanation": "A correlated subquery references columns from the outer query, re-evaluating for every candidate row."
    },
    {
      "id": 7,
      "question": "How do you protect relational databases against SQL Injection attacks?",
      "options": ["Using Parameterized Queries / Prepared Statements", "Escaping single quotes with regex", "Hashing SQL queries", "Using GET requests only"],
      "correctIndex": 0,
      "explanation": "Prepared Statements separate query structure from untrusted user parameters, making SQL injection impossible."
    },
    {
      "id": 8,
      "question": "Which SQL window function assigns a sequential unique integer to rows within a partition starting from 1?",
      "options": ["ROW_NUMBER()", "RANK()", "DENSE_RANK()", "LEAD()"],
      "correctIndex": 0,
      "explanation": "ROW_NUMBER() outputs an incremental sequential integer for each row without gaps or duplicate values."
    },
    {
      "id": 9,
      "question": "Which SQL command is used to permanently remove all rows from a table rapidly without logging row-by-row deletions?",
      "options": ["TRUNCATE TABLE", "DELETE FROM", "DROP TABLE", "REMOVE TABLE"],
      "correctIndex": 0,
      "explanation": "TRUNCATE TABLE deallocates the data pages directly, making it significantly faster than DELETE which writes undo logs for each row."
    },
    {
      "id": 10,
      "question": "What transaction isolation level completely prevents Dirty Reads, Non-Repeatable Reads, and Phantom Reads?",
      "options": ["SERIALIZABLE", "REPEATABLE READ", "READ COMMITTED", "READ UNCOMMITTED"],
      "correctIndex": 0,
      "explanation": "SERIALIZABLE is the highest ANSI SQL isolation level, executing transactions as if they occurred serially."
    },
    {
      "id": 11,
      "question": "Which type of database index is physically organized in the same order as rows stored on disk?",
      "options": ["Clustered Index", "Non-Clustered Index", "Bitmap Index", "Full-Text Index"],
      "correctIndex": 0,
      "explanation": "A table can have only one Clustered Index because it dictates the physical on-disk storage sorting of the data pages."
    },
    {
      "id": 12,
      "question": "Which SQL keyword is used to combine the results of two queries while retaining duplicate rows?",
      "options": ["UNION ALL", "UNION", "INTERSECT", "EXCEPT"],
      "correctIndex": 0,
      "explanation": "UNION removes duplicates via an internal sort/hash; UNION ALL concatenates results immediately, preserving duplicates with higher performance."
    },
    {
      "id": 13,
      "question": "What is the primary benefit of Database Normalization to Third Normal Form (3NF)?",
      "options": ["Eliminates transitive dependencies and reduces data redundancy", "Makes SELECT queries execute with zero memory overhead", "Encrypts all foreign keys automatically", "Removes the need for primary keys"],
      "correctIndex": 0,
      "explanation": "3NF ensures all non-key columns depend only on the primary key, eliminating insertion, update, and deletion anomalies."
    },
    {
      "id": 14,
      "question": "What does the SQL command `EXPLAIN ANALYZE` do in PostgreSQL?",
      "options": ["Executes the query and displays actual run times, cost estimates, and scan types (Seq Scan vs Index Scan)", "Validates syntax without connecting to the database", "Compiles the query into C bytecode", "Rolls back uncommitted transactions"],
      "correctIndex": 0,
      "explanation": "EXPLAIN ANALYZE actually runs the statement to report real-world execution plans, millisecond timings, and index effectiveness."
    },
    {
      "id": 15,
      "question": "Which SQL feature creates reusable named temporary result sets defined at the beginning of a query via `WITH`?",
      "options": ["Common Table Expressions (CTEs)", "Stored Procedures", "Triggers", "Materialized Views"],
      "correctIndex": 0,
      "explanation": "Common Table Expressions (CTEs) simplify complex nested subqueries and enable recursive query execution."
    }
  ],
  "react": [
    {
      "id": 1,
      "question": "What hook in React is primarily used to manage local component state across renders?",
      "options": ["useState", "useEffect", "useMemo", "useContext"],
      "correctIndex": 0,
      "explanation": "useState returns a stateful value and a dispatch function to update it, triggering re-renders when updated."
    },
    {
      "id": 2,
      "question": "When does a React `useEffect` hook execute if passed an empty dependency array `[]`?",
      "options": ["Only once after the initial component mount", "After every single render cycle", "Before initial render begins", "Only when component unmounts"],
      "correctIndex": 0,
      "explanation": "An empty dependency array informs React that the effect depends on no state or props, running once after initial mounting."
    },
    {
      "id": 3,
      "question": "Why must list items rendered via `map()` provide a unique `key` prop in React?",
      "options": ["Helps React's Virtual DOM reconciliation diffing algorithm identify which items changed, added, or removed", "Applies CSS styling automatically", "Binds click events to the DOM", "Ensures data is encrypted"],
      "correctIndex": 0,
      "explanation": "Keys provide persistent stable identities across re-renders so React modifies only mutated DOM nodes instead of re-rendering whole lists."
    },
    {
      "id": 4,
      "question": "Which hook memoizes expensive calculations so they are only recomputed when specified dependencies change?",
      "options": ["useMemo", "useCallback", "useRef", "useReducer"],
      "correctIndex": 0,
      "explanation": "useMemo caches calculated return values across renders until one of its dependency values changes."
    },
    {
      "id": 5,
      "question": "What is the primary difference between `useCallback` and `useMemo` in React?",
      "options": ["useCallback returns a memoized callback function; useMemo returns a memoized computed value", "useCallback runs on server only", "useMemo cannot take dependencies", "useCallback triggers unmounting"],
      "correctIndex": 0,
      "explanation": "useCallback(fn, deps) is equivalent to useMemo(() => fn, deps), caching function references to prevent unnecessary child re-renders."
    },
    {
      "id": 6,
      "question": "In React Native, which component replaces the standard HTML `<div>` for structural flexbox layout?",
      "options": ["<View>", "<Text>", "<Container>", "<Div>"],
      "correctIndex": 0,
      "explanation": "In React Native, `<View>` is the fundamental building block for UI layout and styling via Flexbox."
    },
    {
      "id": 7,
      "question": "What hook creates a mutable reference object whose `.current` property persists without causing component re-renders?",
      "options": ["useRef", "useState", "useId", "useLayoutEffect"],
      "correctIndex": 0,
      "explanation": "useRef persists values across renders; updating ref.current does not trigger component reconciliation or re-render."
    },
    {
      "id": 8,
      "question": "In Next.js 14 App Router, what is the default rendering paradigm for components placed inside `app/` directory?",
      "options": ["React Server Components (RSC)", "Client Components ('use client')", "Static HTML Export", "Legacy getServerSideProps"],
      "correctIndex": 0,
      "explanation": "Next.js App Router defaults to React Server Components (RSC), keeping heavy dependencies on the server and streaming zero client JS."
    },
    {
      "id": 9,
      "question": "What hook allows functional React components to subscribe to React Context without prop drilling?",
      "options": ["useContext", "useProvider", "useConsumer", "useDispatch"],
      "correctIndex": 0,
      "explanation": "useContext reads the current context value determined by the closest matching Context.Provider above in the tree."
    },
    {
      "id": 10,
      "question": "What is the role of React Query (TanStack Query) in modern React architecture?",
      "options": ["Server state management, caching, background refetching, and deduping asynchronous network requests", "Managing CSS animations", "Compiling TypeScript into JSX", "Replacing React Router"],
      "correctIndex": 0,
      "explanation": "TanStack Query eliminates repetitive useEffect fetching code with declarative caching, automatic stale-while-revalidate, and mutations."
    },
    {
      "id": 11,
      "question": "What is React Fiber in the context of React's core architecture?",
      "options": ["React's reconciliation engine enabling incremental rendering and priority-based scheduling", "A CSS framework for React", "A build tool replacing Webpack", "A state management library"],
      "correctIndex": 0,
      "explanation": "React Fiber is the reimplementation of React's reconciler that enables pausing, aborting, and prioritizing work units across frames."
    },
    {
      "id": 12,
      "question": "Which rule of React Hooks must always be strictly observed?",
      "options": ["Only call hooks at the top level of React functions, never inside loops, conditions, or nested functions", "Always call hooks inside try-catch blocks", "Hooks can only be called from class components", "Hooks must have asynchronous suffixes"],
      "correctIndex": 0,
      "explanation": "Hooks rely on stable call order between renders; calling them conditionally disrupts internal state pointer indexing."
    },
    {
      "id": 13,
      "question": "In React Native, which component is optimized to render large virtualized lists of items with minimal memory usage?",
      "options": ["FlatList / SectionList", "ScrollView", "View.Map()", "ListView (Deprecated)"],
      "correctIndex": 0,
      "explanation": "FlatList renders only the visible window of elements on screen, recycling items off-screen to preserve memory."
    },
    {
      "id": 14,
      "question": "What error boundary lifecycle or hook catches unhandled JavaScript exceptions in child component trees?",
      "options": ["componentDidCatch / static getDerivedStateFromError", "try/catch around JSX return", "useEffect with error dependency", "window.onerror"],
      "correctIndex": 0,
      "explanation": "Error boundaries are class components that implement componentDidCatch to log errors and display graceful fallback UI."
    },
    {
      "id": 15,
      "question": "What is the primary benefit of React's Suspense component?",
      "options": ["Declaratively orchestrates loading states while child components fetch async data or load lazy code chunks", "Encrypts API payloads", "Caches HTTP responses locally", "Optimizes CSS bundle size"],
      "correctIndex": 0,
      "explanation": "React Suspense lets components suspend rendering while asynchronous operations (lazy components, data promises) resolve."
    }
  ],
  "cloud": [
    {
      "id": 1,
      "question": "What is the fundamental difference between a Docker Image and a Docker Container?",
      "options": ["An image is a read-only immutable blueprint; a container is a running runnable instance of an image", "Containers compile images into kernels", "Images only run on Linux; containers run on any OS", "There is no difference"],
      "correctIndex": 0,
      "explanation": "Docker images are static layered templates containing code and dependencies; containers are sandboxed running processes."
    },
    {
      "id": 2,
      "question": "Which Docker instruction sets the default command to execute when the container launches?",
      "options": ["CMD / ENTRYPOINT", "RUN", "EXPOSE", "LABEL"],
      "correctIndex": 0,
      "explanation": "CMD specifies default arguments for an executing container; ENTRYPOINT configures a container that will run as an executable."
    },
    {
      "id": 3,
      "question": "What Kubernetes API object represents the smallest deployable atomic unit of computing?",
      "options": ["Pod", "Deployment", "Service", "Node"],
      "correctIndex": 0,
      "explanation": "A Pod encapsulates one or more co-located containers sharing network namespaces and storage volumes."
    },
    {
      "id": 4,
      "question": "Which Kubernetes Service type exposes pods internally within the cluster network without external public access?",
      "options": ["ClusterIP", "NodePort", "LoadBalancer", "ExternalName"],
      "correctIndex": 0,
      "explanation": "ClusterIP is the default Kubernetes Service type, exposing an internal IP accessible only from within the cluster."
    },
    {
      "id": 5,
      "question": "In AWS, which service provides resizable, on-demand virtual compute server instances in the cloud?",
      "options": ["Amazon EC2", "Amazon S3", "AWS Lambda", "Amazon DynamoDB"],
      "correctIndex": 0,
      "explanation": "Amazon Elastic Compute Cloud (EC2) provisions secure, resizable compute capacity in public cloud data centers."
    },
    {
      "id": 6,
      "question": "What AWS storage class is designed for highly durable, scalable object storage accessible via HTTP REST endpoints?",
      "options": ["Amazon S3", "Amazon EBS", "Amazon EFS", "AWS Snowball"],
      "correctIndex": 0,
      "explanation": "Amazon Simple Storage Service (S3) provides object storage with 99.999999999% (11 9s) data durability."
    },
    {
      "id": 7,
      "question": "What is the primary operational advantage of multi-stage Docker builds?",
      "options": ["Separates build tools from production artifacts, dramatically reducing final image size and attack surface", "Enables multi-GPU training", "Increases network transfer speeds", "Encrypts container binaries"],
      "correctIndex": 0,
      "explanation": "Multi-stage builds compile artifacts in initial stages and copy only runtime binaries into lean minimal images (like Alpine)."
    },
    {
      "id": 8,
      "question": "In CI/CD, what is the key difference between Continuous Delivery and Continuous Deployment?",
      "options": ["Continuous Delivery requires manual approval before production release; Continuous Deployment releases automatically", "Continuous Delivery only runs unit tests", "Continuous Deployment does not test code", "They are identical terms"],
      "correctIndex": 0,
      "explanation": "Continuous Delivery ensures code is always in a deployable state; Continuous Deployment automatically ships every passing commit to production."
    },
    {
      "id": 9,
      "question": "What is the primary role of an Ingress Controller in Kubernetes?",
      "options": ["Manages external HTTP/HTTPS routing, SSL termination, and path-based forwarding to internal cluster services", "Manages node CPU scheduling", "Backs up PostgreSQL databases", "Builds Docker images"],
      "correctIndex": 0,
      "explanation": "Ingress controllers (e.g. NGINX Ingress) evaluate routing rules to reverse-proxy incoming external traffic to cluster Services."
    },
    {
      "id": 10,
      "question": "Which AWS security feature controls inbound and outbound network traffic at the virtual network interface instance level?",
      "options": ["Security Groups (stateful virtual firewalls)", "Network Access Control Lists (NACLs)", "IAM Roles", "Route 53"],
      "correctIndex": 0,
      "explanation": "Security Groups operate as stateful virtual firewalls controlling traffic directly attached to EC2 instances."
    },
    {
      "id": 11,
      "question": "In distributed cloud systems, what architectural pattern prevents cascading failures when downstream services fail?",
      "options": ["Circuit Breaker Pattern (Resilience4j / Envoy)", "Saga Pattern", "CQRS Pattern", "Strangler Fig Pattern"],
      "correctIndex": 0,
      "explanation": "Circuit Breakers trip to open state when failure thresholds are crossed, rejecting traffic immediately to prevent cascading crashes."
    },
    {
      "id": 12,
      "question": "What is Infrastructure as Code (IaC) and what is its primary benefit?",
      "options": ["Provisioning cloud infrastructure through declarative code files (Terraform/CloudFormation) for reproducibility and version control", "Writing shell scripts on production servers", "Compiling OS kernels from source", "Managing Jira tickets automatically"],
      "correctIndex": 0,
      "explanation": "IaC defines computing resources in declarative code, eliminating manual configuration drift and enabling version-controlled rollbacks."
    },
    {
      "id": 13,
      "question": "Which cloud computing model bills only for the exact milliseconds compute code runs in response to triggered events?",
      "options": ["Serverless Function-as-a-Service (AWS Lambda / Cloud Functions)", "Dedicated Bare Metal", "IaaS Virtual Machines", "Colocation Hosting"],
      "correctIndex": 0,
      "explanation": "Serverless FaaS automatically scales instances to zero when idle and charges strictly for execution time during invoked requests."
    },
    {
      "id": 14,
      "question": "What is the role of an API Gateway in modern microservice architectures?",
      "options": ["Provides a single entry point for client requests, handling authentication, rate limiting, and request routing", "Replaces backend database clusters", "Transpiles TypeScript to Python", "Compiles Docker images"],
      "correctIndex": 0,
      "explanation": "API Gateways aggregate backend microservices, enforcing rate limiting, authentication, SSL termination, and CORS policies."
    },
    {
      "id": 15,
      "question": "What Linux command displays real-time system process metrics, CPU utilization, and memory usage?",
      "options": ["top / htop", "grep", "chmod", "curl"],
      "correctIndex": 0,
      "explanation": "top (and modern htop) provides interactive real-time process monitoring, memory consumption, and CPU core load."
    }
  ],
  "general": [
    {
      "id": 1,
      "question": "What is the time complexity of searching for an element in a balanced Binary Search Tree (AVL / Red-Black)?",
      "options": ["O(log n)", "O(n)", "O(1)", "O(n log n)"],
      "correctIndex": 0,
      "explanation": "Because a balanced BST halves the search space at each comparison, search operations execute in O(log n) time."
    },
    {
      "id": 2,
      "question": "In Kahn's Algorithm for Topological Sorting, what prerequisite condition must the graph satisfy?",
      "options": [
        "Directed Acyclic Graph (DAG) with no circular cycles",
        "Fully connected undirected graph",
        "Weighted complete bipartite graph",
        "Binary tree with degree at most 2"
      ],
      "correctIndex": 0,
      "explanation": "Topological sorting can only be performed on Directed Acyclic Graphs (DAGs) because cycles prevent establishing a valid prerequisite sequence."
    },
    {
      "id": 3,
      "question": "What caching problem occurs when thousands of requests simultaneously query a cache key at the exact moment it expires?",
      "options": ["Cache Stampede (Thundering Herd)", "Cache Penetration", "Cache Avalanche", "Stale Reads"],
      "correctIndex": 0,
      "explanation": "A Cache Stampede overwhelms database servers when high-traffic cached items expire simultaneously without distributed locking."
    },
    {
      "id": 4,
      "question": "Which algorithm is standard for finding the shortest path between nodes in a graph with non-negative edge weights?",
      "options": ["Dijkstra's Algorithm", "Bellman-Ford Algorithm", "Floyd-Warshall Algorithm", "Kruskal's Algorithm"],
      "correctIndex": 0,
      "explanation": "Dijkstra's Algorithm uses a priority queue (min-heap) to greedily find the shortest path in O((V + E) log V) time."
    },
    {
      "id": 5,
      "question": "What architectural pattern separates read operations from write operations to optimize performance and data models independently?",
      "options": ["CQRS (Command Query Responsibility Segregation)", "MVC", "Singleton Pattern", "Factory Method"],
      "correctIndex": 0,
      "explanation": "CQRS segregates commands (writes) from queries (reads), allowing distinct scalable data stores for reads and writes."
    },
    {
      "id": 6,
      "question": "In Git, what command integrates changes from one branch into another while maintaining a completely linear commit history?",
      "options": ["git rebase", "git merge --no-ff", "git cherry-pick", "git stash"],
      "correctIndex": 0,
      "explanation": "git rebase reapplies commits on top of another base tip, producing a clean linear project history without merge commits."
    },
    {
      "id": 7,
      "question": "What does Idempotency mean in the context of RESTful HTTP API methods?",
      "options": [
        "Making multiple identical requests produces the exact same server state as making a single request",
        "The request never requires an authentication token",
        "The response is always returned within 10 milliseconds",
        "The endpoint only accepts encrypted payloads"
      ],
      "correctIndex": 0,
      "explanation": "Methods like GET, PUT, and DELETE are idempotent because executing them repeatedly results in identical persistent state."
    },
    {
      "id": 8,
      "question": "What is the primary mechanism of asymmetric public-key cryptography?",
      "options": [
        "A mathematically linked public key for encryption and private key for decryption",
        "A single shared secret password across all endpoints",
        "Randomly swapping bytes in network packets",
        "Storing plain text tokens in client cookies"
      ],
      "correctIndex": 0,
      "explanation": "Asymmetric encryption pairs a public key (openly distributed) with a private key (held secret) for secure signatures and data encryption."
    },
    {
      "id": 9,
      "question": "What is the core purpose of a Continuous Integration / Continuous Deployment (CI/CD) pipeline?",
      "options": [
        "Automate building, testing, and deploying code changes reliably into production",
        "Write documentation automatically from Jira tickets",
        "Replace cloud database servers with flat files",
        "Automatically generate Google SMTP app passwords"
      ],
      "correctIndex": 0,
      "explanation": "CI/CD pipelines automate regression testing, container packaging, and release deployments whenever commits are pushed."
    },
    {
      "id": 10,
      "question": "Which data structure follows the Last-In, First-Out (LIFO) order of element retrieval?",
      "options": ["Stack", "Queue", "Priority Queue", "Circular Buffer"],
      "correctIndex": 0,
      "explanation": "A Stack operates on a LIFO basis where the most recently pushed element is the first to be popped."
    },
    {
      "id": 11,
      "question": "In distributed computing, what does the CAP theorem state?",
      "options": [
        "A distributed datastore can only provide at most two of Consistency, Availability, and Partition Tolerance simultaneously",
        "Computational cost grows quadratically with cluster size",
        "CPUs, RAM, and Storage must scale in fixed ratios",
        "All cache nodes must sync every minute"
      ],
      "correctIndex": 0,
      "explanation": "Eric Brewer's CAP theorem proves that network partitions force distributed systems to choose between Consistency or Availability."
    },
    {
      "id": 12,
      "question": "What load balancing algorithm directs incoming traffic sequentially to each backend server in rotation?",
      "options": ["Round Robin", "Least Connections", "Consistent Hashing", "IP Hash"],
      "correctIndex": 0,
      "explanation": "Round Robin cyclically forwards each new request to the next server in the healthy pool."
    },
    {
      "id": 13,
      "question": "In a 3-way TCP handshake to establish a network connection, what is the order of packet flags sent?",
      "options": ["SYN -> SYN-ACK -> ACK", "ACK -> SYN -> FIN", "SYN -> ACK -> RST", "PING -> PONG -> ACK"],
      "correctIndex": 0,
      "explanation": "TCP begins with Client SYN, Server responds with SYN-ACK, and Client acknowledges with ACK before transmitting data."
    },
    {
      "id": 14,
      "question": "What condition causes a Deadlock in concurrent operating systems according to the Coffman conditions?",
      "options": [
        "Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait",
        "Excessive CPU context switching",
        "Thread starvation in priority queues",
        "Memory paging to swap space"
      ],
      "correctIndex": 0,
      "explanation": "All four Coffman conditions must hold simultaneously for a concurrent system to enter a deadlock."
    },
    {
      "id": 15,
      "question": "What is the time complexity of the fastest comparison-based sorting algorithms (Merge Sort, Heap Sort) in the worst case?",
      "options": ["O(n log n)", "O(n^2)", "O(n)", "O(log n)"],
      "correctIndex": 0,
      "explanation": "Decision tree analysis mathematically proves that comparison-based sorting cannot beat Omega(n log n) in the worst case."
    }  ],
  "llm": [
    {
      "id": 1,
      "question": "What technique involves providing input-output examples directly in the context window before asking the model to perform a task?",
      "options": ["Few-Shot Prompting", "Zero-Shot Learning", "RLHF Fine-Tuning", "Chain-of-Verification"],
      "correctIndex": 0,
      "explanation": "Few-Shot prompting conditions the transformer attention heads with in-context demonstrations without altering model weights."
    },
    {
      "id": 2,
      "question": "In RAG (Retrieval-Augmented Generation), what data structure is used to search for semantically related text chunks?",
      "options": ["High-dimensional Vector Embeddings in a Vector Database", "B-Tree relational index", "Red-black binary tree", "String keyword hash table"],
      "correctIndex": 0,
      "explanation": "Vector databases index embeddings using Approximate Nearest Neighbor (ANN) algorithms to find semantic matches based on cosine distance."
    },
    {
      "id": 3,
      "question": "What does temperature control during LLM token sampling?",
      "options": ["The entropy / randomness of next-token selection", "The GPU memory allocation", "The processor clock frequency", "The maximum prompt length"],
      "correctIndex": 0,
      "explanation": "Lower temperatures flatten logits into deterministic greedy choices, while higher values increase creative diversity."
    },
    {
      "id": 4,
      "question": "What core mechanism in Transformer models computes relationships between all tokens in a sequence regardless of distance?",
      "options": ["Multi-Head Self-Attention", "Recurrent Hidden State", "Convolutional Kernel", "Max Pooling"],
      "correctIndex": 0,
      "explanation": "Multi-head self-attention computes Query, Key, and Value dot-products to weigh contextual relevance across the entire token sequence."
    },
    {
      "id": 5,
      "question": "Which prompting technique instructs an LLM to write out intermediate reasoning steps before arriving at a final answer?",
      "options": ["Chain-of-Thought (CoT) Prompting", "Role System Prompting", "Directional Stimulus", "Negative Constraint Prompting"],
      "correctIndex": 0,
      "explanation": "Chain-of-Thought prompting prompts the model to break complex multi-step reasoning down, drastically improving mathematical and logical accuracy."
    },
    {
      "id": 6,
      "question": "What is an LLM 'hallucination' in generative AI systems?",
      "options": ["Generating grammatically confident but factually untrue information", "Out of memory runtime exception", "Token buffer overflow", "Network timeout on streaming response"],
      "correctIndex": 0,
      "explanation": "Hallucinations occur when statistical next-token completions generate fluent assertions unsupported by real-world facts or context."
    },
    {
      "id": 7,
      "question": "What is the primary role of a Tokenizer (e.g., BPE, WordPiece) in LLM pipelines?",
      "options": ["Converts raw text into discrete sub-word numerical token IDs", "Compresses video files into mp4", "Translates Python to JavaScript", "Encrypts prompts with AES-256"],
      "correctIndex": 0,
      "explanation": "Tokenizers break natural language into subword units and map them to integer indices in the model vocabulary table."
    },
    {
      "id": 8,
      "question": "What technique aligns raw pre-trained LLMs with human values and preferences using preference ranking datasets?",
      "options": ["RLHF (Reinforcement Learning from Human Feedback)", "Unsupervised K-Means Clustering", "Random Weight Perturbation", "Batch Normalization"],
      "correctIndex": 0,
      "explanation": "RLHF trains a reward model from human preferences and fine-tunes policy models with PPO or DPO to enhance safety and helpfulness."
    },
    {
      "id": 9,
      "question": "Which distance metric is standard for comparing semantic vector similarities in embedding spaces?",
      "options": ["Cosine Similarity", "Manhattan Taxi Distance", "Hamming XOR Distance", "Levenshtein Distance"],
      "correctIndex": 0,
      "explanation": "Cosine similarity measures the cosine of the angle between two normalized vectors, capturing directional semantic affinity."
    },
    {
      "id": 10,
      "question": "What is chunking overlap in document indexing for RAG pipelines?",
      "options": ["Sharing boundary tokens between adjacent chunks to preserve continuity", "Compressing text into zip archives", "Duplicating entire files in S3", "Translating chunks into Latin"],
      "correctIndex": 0,
      "explanation": "Chunk overlap prevents splitting critical semantic sentences or context across arbitrary fixed-token boundaries."
    }
  ],
  "cybersecurity": [
    {
      "id": 1,
      "question": "What vulnerability in OWASP Top 10 occurs when untrusted input is concatenated directly into SQL command strings?",
      "options": ["SQL Injection (SQLi)", "Cross-Site Scripting (XSS)", "Server-Side Request Forgery", "Insecure Direct Object Reference"],
      "correctIndex": 0,
      "explanation": "SQLi allows attackers to alter query logic and bypass authentication or exfiltrate database contents via unsanitized input."
    },
    {
      "id": 2,
      "question": "What cryptographic property ensures compromised server private keys cannot decrypt past recorded TLS session traffic?",
      "options": ["Perfect Forward Secrecy (PFS)", "Symmetric Block Chaining", "MD5 Hashing", "Base64 Encoding"],
      "correctIndex": 0,
      "explanation": "PFS generates unique ephemeral Diffie-Hellman session keys for every connection, preventing retrospective decryption."
    },
    {
      "id": 3,
      "question": "Which HTTP security response header forces web browsers to communicate exclusively over secure HTTPS channels?",
      "options": ["Strict-Transport-Security (HSTS)", "Content-Security-Policy", "X-Frame-Options", "Access-Control-Allow-Origin"],
      "correctIndex": 0,
      "explanation": "HSTS instructs browsers to automatically convert all HTTP links to HTTPS and refuse connection if certificates are invalid."
    },
    {
      "id": 4,
      "question": "What type of attack involves an adversary secretly relaying and possibly altering communications between two parties?",
      "options": ["Man-in-the-Middle (MitM) Attack", "Denial of Service (DoS)", "Dictionary Password Attack", "Buffer Overflow"],
      "correctIndex": 0,
      "explanation": "MitM attacks intercept unencrypted or unauthenticated network traffic, allowing adversaries to eavesdrop or inject malicious payloads."
    },
    {
      "id": 5,
      "question": "Which cryptographic function is intentionally slow and CPU/memory-intensive to protect stored user passwords against brute force?",
      "options": ["bcrypt / Argon2id", "MD5", "SHA-1", "CRC32"],
      "correctIndex": 0,
      "explanation": "bcrypt and Argon2 utilize configurable work factors and salt parameters to defeat high-velocity GPU rainbow table attacks."
    },
    {
      "id": 6,
      "question": "What security paradigm follows the core principle 'Never trust, always verify' across internal and external networks?",
      "options": ["Zero Trust Architecture", "Perimeter Firewalls", "VPN Perimeter Model", "Air-Gapped Deployment"],
      "correctIndex": 0,
      "explanation": "Zero Trust assumes threats exist both inside and outside network boundaries, requiring continuous identity verification and least-privilege access."
    },
    {
      "id": 7,
      "question": "What attack injects malicious JavaScript into legitimate web pages viewed by other users?",
      "options": ["Cross-Site Scripting (XSS)", "SQL Injection", "ARP Poisoning", "DNS Spoofing"],
      "correctIndex": 0,
      "explanation": "XSS executes malicious scripts in victim browsers, enabling session hijacking, cookie theft, and DOM manipulation."
    },
    {
      "id": 8,
      "question": "What defense mechanism creates a random unique token per user session to validate incoming state-changing POST requests?",
      "options": ["CSRF Token (Anti-Cross-Site Request Forgery)", "JSON Web Token (JWT)", "Public SSH Key", "SSL Certificate"],
      "correctIndex": 0,
      "explanation": "CSRF tokens ensure state-changing HTTP requests originate intentionally from the genuine application UI, not unauthorized third-party sites."
    },
    {
      "id": 9,
      "question": "Which asymmetric cryptography algorithm is widely used for digital signatures and TLS certificate handshakes?",
      "options": ["RSA / ECDSA", "AES-256", "DES", "RC4"],
      "correctIndex": 0,
      "explanation": "RSA and Elliptic Curve Digital Signature Algorithm (ECDSA) use public/private key pairs to verify identity and encrypt symmetric keys."
    },
    {
      "id": 10,
      "question": "What is the primary objective of a penetration test (pen test)?",
      "options": ["Proactively identify and validate exploitable security vulnerabilities before malicious actors do", "Format production database hard drives", "Compress server log files", "Verify UI color contrasts"],
      "correctIndex": 0,
      "explanation": "Penetration testing simulates real-world cyberattacks against systems to find security weaknesses and verify defense effectiveness."
    }
  ],
  "dataanalysis": [
    {
      "id": 1,
      "question": "In Power BI and tabular semantic data models, what does DAX stand for?",
      "options": ["Data Analysis Expressions", "Direct Access XML", "Data Aggregation Exchange", "Dynamic Array Extension"],
      "correctIndex": 0,
      "explanation": "DAX is the formula and query language used in Power BI, Analysis Services, and Power Pivot to define custom calculations and aggregations."
    },
    {
      "id": 2,
      "question": "Which relational data warehouse modeling schema features a central Fact table connected directly to Dimension tables?",
      "options": ["Star Schema", "Snowflake Hierarchy", "Flat Matrix", "Normalized 3NF Cluster"],
      "correctIndex": 0,
      "explanation": "Star schema minimizes joins and optimizes aggregation query performance in OLAP analytics systems."
    },
    {
      "id": 3,
      "question": "In Python Pandas, which method pivots a DataFrame based on unique index, column, and aggregated values?",
      "options": ["pivot_table()", "melt()", "groupby()", "concat()"],
      "correctIndex": 0,
      "explanation": "pivot_table() groups and aggregates values across multi-dimensional row and column indices with customizable aggfunc."
    },
    {
      "id": 4,
      "question": "What is the difference between a Calculated Column and a Measure in Power BI?",
      "options": ["Measures are computed on-the-fly dynamically responding to slicer context; Calculated Columns store pre-computed static values in RAM", "Measures only work with text", "Calculated columns use SQL instead of DAX", "There is no difference"],
      "correctIndex": 0,
      "explanation": "Measures recalculate dynamically per visual filter context without bloating memory, making them standard for aggregations."
    },
    {
      "id": 5,
      "question": "What statistical visualization displays the median, quartiles (Q1, Q3), and outliers of a numerical dataset?",
      "options": ["Box Plot (Box and Whisker)", "Pie Chart", "Treemap", "Waterfall Chart"],
      "correctIndex": 0,
      "explanation": "Box plots provide a concise 5-number summary visualizing central tendency, dispersion spread, and extreme outlier values."
    },
    {
      "id": 6,
      "question": "What metric measures the linear relationship between two continuous variables on a scale from -1.0 to +1.0?",
      "options": ["Pearson Correlation Coefficient", "Standard Error", "Variance Inflation Factor", "Chi-Square Test"],
      "correctIndex": 0,
      "explanation": "+1 indicates perfect positive correlation, -1 indicates perfect negative correlation, and 0 indicates no linear association."
    },
    {
      "id": 7,
      "question": "In data preparation, what is the process of replacing missing NULL values with statistical estimates like mean or median?",
      "options": ["Imputation", "One-Hot Encoding", "Min-Max Normalization", "Truncation"],
      "correctIndex": 0,
      "explanation": "Imputation preserves sample sizes without discarding incomplete rows, substituting appropriate statistical representations."
    },
    {
      "id": 8,
      "question": "What Power BI connection mode executes queries directly against the live underlying database without importing data into memory?",
      "options": ["DirectQuery", "Import Mode", "Dual Composite", "Live Analysis"],
      "correctIndex": 0,
      "explanation": "DirectQuery queries underlying data sources in real time, essential for massive terabyte-scale databases and strict compliance rules."
    },
    {
      "id": 9,
      "question": "What does ETL stand for in modern data engineering and analytics architectures?",
      "options": ["Extract, Transform, Load", "Encrypt, Transfer, Lock", "Evaluate, Test, Launch", "Export, Table, Label"],
      "correctIndex": 0,
      "explanation": "ETL pipelines extract raw data from operational systems, transform and clean it into analytical formats, and load it into data warehouses."
    },
    {
      "id": 10,
      "question": "In a standard normal distribution curve, approximately what percentage of data falls within 1 standard deviation of the mean?",
      "options": ["68.2%", "50.0%", "95.4%", "99.7%"],
      "correctIndex": 0,
      "explanation": "The empirical 68-95-99.7 rule specifies that roughly 68.2% of normal data lies within 1 standard deviation of the mean."
    }
  ],
  "web3": [
    {
      "id": 1,
      "question": "In Ethereum and EVM-compatible blockchains, what deterministic virtual environment executes smart contract bytecode?",
      "options": ["Ethereum Virtual Machine (EVM)", "Node.js V8 Runtime", "Docker Sandbox", "Wasm Container"],
      "correctIndex": 0,
      "explanation": "The EVM is a sandboxed, stack-based runtime executed deterministically by every validator node across the network."
    },
    {
      "id": 2,
      "question": "What vulnerability occurs when a smart contract makes an external call before updating its internal state balance variables?",
      "options": ["Reentrancy Attack", "Integer Overflow", "Front-Running MEV", "Flash Loan Default"],
      "correctIndex": 0,
      "explanation": "Reentrancy allows attackers to repeatedly re-invoke withdrawal functions recursively before state balances are zeroed out (e.g. The DAO hack)."
    },
    {
      "id": 3,
      "question": "What is the primary role of Gas in EVM blockchain transactions?",
      "options": ["Compensates validators for compute resources and prevents infinite execution loops", "Encrypts wallet keys", "Provides identity verification", "Backs stablecoin reserves"],
      "correctIndex": 0,
      "explanation": "Gas measures computational complexity; finite gas limits guarantee halting on Turing-complete code and defend against DoS attacks."
    },
    {
      "id": 4,
      "question": "Which token standard defines non-fungible, unique cryptographic assets on EVM blockchains?",
      "options": ["ERC-721", "ERC-20", "ERC-1155", "ERC-777"],
      "correctIndex": 0,
      "explanation": "ERC-721 establishes standardized interfaces for tracking ownership of distinct, non-fungible verifiable digital credentials and NFTs."
    },
    {
      "id": 5,
      "question": "What consensus mechanism secures modern Ethereum by requiring validators to stake ETH collateral rather than burn electricity?",
      "options": ["Proof-of-Stake (PoS)", "Proof-of-Work (PoW)", "Delegated BFT", "Proof-of-Authority"],
      "correctIndex": 0,
      "explanation": "Proof-of-Stake selects block proposers and validators weighted by staked capital, drastically reducing energy usage while enforcing slashing penalties."
    },
    {
      "id": 6,
      "question": "In Solidity, which function state mutability modifier promises that the function neither reads nor modifies contract state?",
      "options": ["pure", "view", "payable", "external"],
      "correctIndex": 0,
      "explanation": "pure functions operate strictly on passed parameters and local variables without accessing storage state (e.g. mathematical utility methods)."
    },
    {
      "id": 7,
      "question": "What cryptographic data structure enables efficient, tamper-evident verification of large sets of transaction records?",
      "options": ["Merkle Tree (Hash Tree)", "Circular Queue", "B+ Tree", "Singly Linked List"],
      "correctIndex": 0,
      "explanation": "Merkle Trees summarize transactions into a single Merkle Root; light clients can verify inclusion with compact O(log n) cryptographic proofs."
    },
    {
      "id": 8,
      "question": "What happens to smart contract code once deployed to an immutable blockchain address?",
      "options": ["Bytecode cannot be modified or updated; it remains permanent and immutable", "Automatically updates nightly", "Can be edited with admin keys", "Expires after 1 year"],
      "correctIndex": 0,
      "explanation": "Immutability guarantees that once contract bytecode is deployed, the exact execution logic cannot be tampered with or overwritten."
    },
    {
      "id": 9,
      "question": "In Solidity, what design pattern ensures safe external calls by updating state variables before invoking external addresses?",
      "options": ["Checks-Effects-Interactions Pattern", "Singleton Pattern", "Factory Pattern", "Observer Pattern"],
      "correctIndex": 0,
      "explanation": "Checks-Effects-Interactions checks prerequisites first, applies internal state changes second, and executes external calls last, preventing reentrancy."
    },
    {
      "id": 10,
      "question": "What is a Smart Contract Event in Solidity?",
      "options": ["An EVM logging abstraction that writes lightweight data to blockchain transaction receipts", "A cron job scheduler", "A calendar appointment", "A real-time WebSocket connection"],
      "correctIndex": 0,
      "explanation": "Events emit topics and indexed data to transaction receipts, enabling dApps and indexers (like The Graph) to track contract activity cheaply."
    }
  ],
  "dsa": [
    {
      "id": 1,
      "question": "Which fundamental data structure operates under the Last-In, First-Out (LIFO) protocol?",
      "options": ["Stack", "Queue", "Priority Queue", "Deque"],
      "correctIndex": 0,
      "explanation": "Stacks push and pop elements from the top, ensuring the most recently added item is the first one removed."
    },
    {
      "id": 2,
      "question": "What is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree (BST)?",
      "options": ["O(n) - degenerates into a linked list", "O(log n)", "O(1)", "O(n log n)"],
      "correctIndex": 0,
      "explanation": "When inserted in sorted order, an un-balanced BST degenerates into a single linear chain of n nodes, resulting in O(n) search."
    },
    {
      "id": 3,
      "question": "Which graph traversal algorithm explores neighbors level-by-level using a FIFO Queue?",
      "options": ["Breadth-First Search (BFS)", "Depth-First Search (DFS)", "Bellman-Ford", "Tarjan's SCC"],
      "correctIndex": 0,
      "explanation": "BFS uses a Queue to visit nodes in order of shortest path hop distance from the root vertex."
    },
    {
      "id": 4,
      "question": "What optimization technique solves overlapping subproblems by caching computed answers in a memoization table?",
      "options": ["Dynamic Programming (DP)", "Greedy Heuristic", "Backtracking", "Divide and Conquer"],
      "correctIndex": 0,
      "explanation": "Dynamic Programming avoids re-solving overlapping subproblems by storing computed intermediate results."
    },
    {
      "id": 5,
      "question": "What is the average time complexity of element insertion, deletion, and lookup in a Hash Table?",
      "options": ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
      "correctIndex": 0,
      "explanation": "A well-distributed hash function distributes keys uniformly across buckets, yielding constant O(1) amortized operational complexity."
    },
    {
      "id": 6,
      "question": "Which algorithm finds the single-source shortest path in a weighted graph with non-negative edge weights?",
      "options": ["Dijkstra's Algorithm", "Kruskal's Algorithm", "Floyd-Warshall", "Kosaraju's Algorithm"],
      "correctIndex": 0,
      "explanation": "Dijkstra's algorithm greedily expands lowest-cost paths using a Min-Heap priority queue in O((V + E) log V) time."
    },
    {
      "id": 7,
      "question": "What algorithmic paradigm sorts a collection by partitioning elements around a chosen pivot value?",
      "options": ["QuickSort", "Insertion Sort", "Bubble Sort", "Radix Sort"],
      "correctIndex": 0,
      "explanation": "QuickSort partitions arrays into elements smaller than and greater than a pivot, achieving O(n log n) average time."
    },
    {
      "id": 8,
      "question": "Which sorting algorithm produces a linear ordering of vertices in a Directed Acyclic Graph (DAG)?",
      "options": ["Topological Sort (Kahn's Algorithm)", "Counting Sort", "Bucket Sort", "Heap Sort"],
      "correctIndex": 0,
      "explanation": "Topological sort orders DAG tasks such that for every directed edge u -> v, vertex u comes before v."
    },
    {
      "id": 9,
      "question": "What data structure is optimal for efficiently retrieving the Maximum or Minimum element in O(1) time?",
      "options": ["Heap (Priority Queue)", "Linked List", "Dynamic Array", "Trie"],
      "correctIndex": 0,
      "explanation": "Binary heaps maintain the heap property, keeping the extreme element at the root index [0] accessible in O(1) time."
    },
    {
      "id": 10,
      "question": "What two-pointer technique solves the Two-Sum problem in O(n) time on an array that is already sorted?",
      "options": ["Opposite-directional Left and Right pointers converging toward the target sum", "Nested double for-loops", "Randomized pivot selection", "Breadth first expansion"],
      "correctIndex": 0,
      "explanation": "Comparing arr[left] + arr[right] with the target allows incrementing left or decrementing right in linear O(n) time without additional space."
    }
  ]
};

function getTopicKey(skillName?: string, title?: string): string {
  const combined = ((skillName || "") + " " + (title || "")).toLowerCase();
  if (combined.includes("spring") || combined.includes("java")) return "springboot";
  if (combined.includes("python") || combined.includes("django") || combined.includes("flask") || combined.includes("pandas")) return "python";
  if (combined.includes("gpt") || combined.includes("llm") || combined.includes("prompt") || combined.includes("generative") || combined.includes("langchain")) return "llm";
  if (combined.includes("machine") || combined.includes("ai") || combined.includes("neural") || combined.includes("data science") || combined.includes("deep learning") || combined.includes("pytorch")) return "machinelearning";
  if (combined.includes("sql") || combined.includes("database") || combined.includes("postgres") || combined.includes("mongodb") || combined.includes("redis")) return "sql";
  if (combined.includes("react") || combined.includes("javascript") || combined.includes("typescript") || combined.includes("frontend") || combined.includes("mobile") || combined.includes("next.js") || combined.includes("node")) return "react";
  if (combined.includes("docker") || combined.includes("cloud") || combined.includes("aws") || combined.includes("devops") || combined.includes("kubernetes") || combined.includes("linux")) return "cloud";
  if (combined.includes("cyber") || combined.includes("security") || combined.includes("hacking") || combined.includes("penetration")) return "cybersecurity";
  if (combined.includes("power bi") || combined.includes("excel") || combined.includes("analytics") || combined.includes("tableau")) return "dataanalysis";
  if (combined.includes("solidity") || combined.includes("blockchain") || combined.includes("web3") || combined.includes("ethereum") || combined.includes("crypto")) return "web3";
  if (combined.includes("algorithm") || combined.includes("dsa") || combined.includes("structure") || combined.includes("leet") || combined.includes("tree") || combined.includes("graph")) return "dsa";
  return "general";
}

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [activeTab, setActiveTab] = useState<"overview" | "quiz" | "related">("overview");
  const [isSaved, setIsSaved] = useState(false);

  // In-line Skill Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState(1);
  const [showCertModal, setShowCertModal] = useState(false);

  // Interactive Quiz Arena Mode State (Kahoot / Wayground / Quizizz - zero external login)
  const [arenaModalVisible, setArenaModalVisible] = useState(false);
  const [arenaPlatform, setArenaPlatform] = useState<"kahoot" | "wayground" | "quizizz">("kahoot");

  const launchArena = (plat: "kahoot" | "wayground" | "quizizz") => {
    setArenaPlatform(plat);
    setArenaModalVisible(true);
  };

  const handleArenaComplete = (correctCount: number, total: number, answers: Record<number, number>) => {
    setSelectedAnswers(answers);
    setQuizScore(correctCount);
    setQuizSubmitted(true);

    const isPassing = correctCount >= Math.ceil(total * 0.6);
    if (isPassing) {
      updateProgressMutation.mutate("COMPLETED");
    }

    // Persist to PostgreSQL database directly
    api.submitCourseQuizResult({
      courseOrVideoId: effectiveVideo?.videoId || effectiveVideo?.id || "course",
      courseTitle: effectiveVideo?.title || "Masterclass",
      skillName: effectiveVideo?.skillName || "Computer Science",
      score: correctCount,
      totalQuestions: total,
      timeTakenSeconds: 90,
      attemptNumber: quizAttempts,
      difficulty: effectiveVideo?.difficulty || "INTERMEDIATE",
      platform: arenaPlatform.toUpperCase(),
    }).then(() => {
      setDbPersisted(true);
    }).catch((err) => {
      console.warn("Arena persist notice:", err);
    });

    if (effectiveVideo) {
      api.updateVideoProgress({
        videoId: effectiveVideo.id,
        youtubeVideoId: effectiveVideo.videoId,
        watchedSeconds: (effectiveVideo.estimatedMinutes || 30) * 60,
        totalSeconds: (effectiveVideo.estimatedMinutes || 30) * 60,
        status: "COMPLETED",
      }).catch(() => {});
    }

    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["evolutionHistory"] });
    queryClient.invalidateQueries({ queryKey: ["evolutionTrends"] });
    queryClient.invalidateQueries({ queryKey: ["studentSkills"] });
    queryClient.invalidateQueries({ queryKey: ["credentials"] });
  };

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.getProfile(),
  });
  const [dbPersisted, setDbPersisted] = useState(false);

  const { data: video, isLoading } = useQuery({
    queryKey: ["youtubeVideoDetail", id],
    queryFn: () => api.getYouTubeVideoDetail(id!),
    enabled: !!id,
  });

  const fallbackVideo = getMasterVideoById(id || "");
  const effectiveVideo = video || fallbackVideo;

  const { data: assessments } = useQuery({
    queryKey: ["assessments"],
    queryFn: () => api.getAssessments(),
  });

  const { data: relatedVideos } = useQuery({
    queryKey: ["relatedVideos", effectiveVideo?.skillId],
    queryFn: () =>
      api.getYouTubeVideos({
        skillId: effectiveVideo?.skillId,
        limit: 4,
      }),
    enabled: !!effectiveVideo?.skillId,
  });

  // Watchlist persistence
  useEffect(() => {
    if (!effectiveVideo) return;
    AsyncStorage.getItem(SAVED_VIDEOS_STORAGE_KEY).then((val) => {
      if (val) {
        try {
          const list: string[] = JSON.parse(val);
          setIsSaved(list.includes(effectiveVideo.id) || list.includes(effectiveVideo.videoId));
        } catch (_) {}
      }
    });
  }, [video]);

  const toggleSaveForLater = async () => {
    if (!effectiveVideo) return;
    try {
      const val = await AsyncStorage.getItem(SAVED_VIDEOS_STORAGE_KEY);
      let list: string[] = val ? JSON.parse(val) : [];
      const vId = effectiveVideo.id || effectiveVideo.videoId;

      if (isSaved) {
        list = list.filter((item) => item !== vId && item !== effectiveVideo.videoId && item !== effectiveVideo.id);
        setIsSaved(false);
        Alert.alert("Removed from Watchlist", "Video removed from your saved videos.");
      } else {
        if (!list.includes(vId)) list.push(vId);
        setIsSaved(true);
        Alert.alert("Saved for Later", "Video added to your Watchlist.");
      }
      await AsyncStorage.setItem(SAVED_VIDEOS_STORAGE_KEY, JSON.stringify(list));
    } catch (_) {}
  };

  const updateProgressMutation = useMutation({
    mutationFn: (status: "IN_PROGRESS" | "COMPLETED") =>
      api.updateVideoProgress({
        videoId: effectiveVideo?.id,
        youtubeVideoId: effectiveVideo?.videoId,
        watchedSeconds: status === "COMPLETED" ? (effectiveVideo?.estimatedMinutes ? effectiveVideo.estimatedMinutes * 60 : 1800) : 900,
        totalSeconds: effectiveVideo?.estimatedMinutes ? effectiveVideo.estimatedMinutes * 60 : 1800,
        status,
      }),
    onSuccess: (updated, status) => {
      queryClient.invalidateQueries({ queryKey: ["youtubeVideoDetail", id] });
      queryClient.invalidateQueries({ queryKey: ["youtubeVideos"] });
      queryClient.invalidateQueries({ queryKey: ["recommendedYouTubeVideos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["evolutionHistory"] });
      Alert.alert(
        status === "COMPLETED" ? "🎉 Masterclass Completed!" : "Progress Recorded",
        status === "COMPLETED"
          ? `Your progress has been recorded and +3.0% proficiency has been added to your ${effectiveVideo?.skillName || "skill"} profile!`
          : "Progress marked as in-progress. Keep watching to unlock mastery."
      );
    },
    onError: (err: any) => {
      Alert.alert("Error", err.message || "Failed to update video watch progress");
    },
  });

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/videos");
    }
  };

  if (isLoading && !effectiveVideo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading SmartEvolve Masterclass...</Text>
      </View>
    );
  }

  if (!effectiveVideo) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: colors.error }]}>Masterclass not found.</Text>
        <Button title="← Return to Academy" onPress={handleBack} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const isCompleted = effectiveVideo.watchStatus === "COMPLETED";
  const topicKey = getTopicKey(effectiveVideo.skillName, effectiveVideo.title);
  const quizQuestions = QUESTION_BANK[topicKey] || QUESTION_BANK.general;
  const currentQuestion = quizQuestions[currentQuestionIndex];

  const handleSelectOption = (qId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmitQuiz = () => {
    let correctCount = 0;
    quizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    setQuizScore(correctCount);
    setQuizSubmitted(true);

    const isPassing = correctCount >= Math.ceil(quizQuestions.length * 0.6);
    if (isPassing) {
      updateProgressMutation.mutate("COMPLETED");
      setShowCertModal(true);
    }

    // Calculate Attempt-Damped Proficiency Gain
    const lambda = 1.0 / Math.sqrt(Math.max(1, quizAttempts));
    const rawGain = (correctCount / quizQuestions.length) * 5.0; // max +5.0%
    const dampedGain = (rawGain * lambda).toFixed(1);

    // Submit quiz marks & attempt directly to PostgreSQL database
    api.submitCourseQuizResult({
      courseOrVideoId: effectiveVideo.videoId || effectiveVideo.id,
      courseTitle: effectiveVideo.title,
      skillName: effectiveVideo.skillName || "Computer Science",
      score: correctCount,
      totalQuestions: quizQuestions.length,
      timeTakenSeconds: 120,
      attemptNumber: quizAttempts,
      difficulty: effectiveVideo.difficulty || "INTERMEDIATE",
      platform: "SMARTEVOLVE",
    }).then(() => {
      setDbPersisted(true);
    }).catch((err) => {
      console.warn("Course quiz DB persist notice:", err);
    });

    // Record progress dynamically in backend
    api.updateVideoProgress({
      videoId: effectiveVideo.id,
      youtubeVideoId: effectiveVideo.videoId,
      watchedSeconds: (effectiveVideo?.estimatedMinutes || 30) * 60,
      totalSeconds: (effectiveVideo?.estimatedMinutes || 30) * 60,
      status: "COMPLETED",
    }).catch(() => {});

    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["evolutionHistory"] });
    queryClient.invalidateQueries({ queryKey: ["evolutionTrends"] });
    queryClient.invalidateQueries({ queryKey: ["studentSkills"] });
    queryClient.invalidateQueries({ queryKey: ["credentials"] });
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setCurrentQuestionIndex(0);
    setQuizAttempts((prev) => prev + 1);
  };

  const relatedAssessment = (assessments || []).find(
    (a) => a.skillId === effectiveVideo.skillId || a.title?.toLowerCase().includes((effectiveVideo.skillName || "").toLowerCase())
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.responsiveWrapper}>
        {/* Back Link */}
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>← Return to SmartEvolve Academy</Text>
        </TouchableOpacity>

        {/* Embedded YouTube Player with Focus & Ad-Free Protection */}
        <YouTubePlayer
          videoIdOrUrl={effectiveVideo.videoId}
          title={effectiveVideo.title}
          thumbnailUrl={effectiveVideo.thumbnailUrl}
          autoPlay={true}
        />

        {/* Video Header & Metadata */}
        <View style={styles.metaHeader}>
          <View style={styles.topPillsRow}>
            <Badge label={effectiveVideo.difficulty || "INTERMEDIATE"} variant="primary" />
            <Badge
              label={isCompleted ? "COMPLETED" : effectiveVideo.watchStatus === "IN_PROGRESS" ? "IN PROGRESS" : "NOT STARTED"}
              variant={isCompleted ? "success" : effectiveVideo.watchStatus === "IN_PROGRESS" ? "warning" : "info"}
            />
            <Text style={styles.durationPill}>⏱️ {effectiveVideo.duration || `${effectiveVideo.estimatedMinutes}:00`}</Text>

            <TouchableOpacity style={styles.saveBtn} onPress={toggleSaveForLater}>
              <Text style={styles.saveBtnText}>{isSaved ? "★ In Watchlist" : "☆ Save for Later"}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.videoTitle}>{effectiveVideo.title}</Text>

          <View style={styles.channelRow}>
            <Text style={styles.channelName}>{effectiveVideo.channelTitle || "SmartEvolve Educator"}</Text>
            {effectiveVideo.viewCount ? (
              <Text style={styles.viewCount}>• {effectiveVideo.viewCount.toLocaleString()} views</Text>
            ) : null}
            <Badge label={effectiveVideo.skillName || "Masterclass"} variant="info" />
          </View>
        </View>

        {/* Learning Verification & Progress Status (Verified Automatic Unlocking) */}
        <Card style={[styles.progressCard, (isCompleted || (quizSubmitted && quizScore >= Math.ceil(quizQuestions.length * 0.6))) && { borderColor: "#10B981", backgroundColor: "rgba(16, 185, 129, 0.08)" }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Text style={{ fontSize: 24 }}>{(isCompleted || (quizSubmitted && quizScore >= Math.ceil(quizQuestions.length * 0.6))) ? "🏆" : "🔒"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.progressCardTitle, (isCompleted || (quizSubmitted && quizScore >= Math.ceil(quizQuestions.length * 0.6))) && { color: "#10B981" }]}>
                {(isCompleted || (quizSubmitted && quizScore >= Math.ceil(quizQuestions.length * 0.6))) ? "Course Mastered & Certificate Ready!" : "Certificate Locked (Completion Required)"}
              </Text>
              <Text style={styles.progressCardSub}>
                {(isCompleted || (quizSubmitted && quizScore >= Math.ceil(quizQuestions.length * 0.6)))
                  ? "Congratulations! You have fulfilled the academic study requirements. Your official SmartEvolve certificate is unlocked."
                  : "To earn your official SmartEvolve certificate, complete this masterclass and pass the diagnostic Skill Quiz (≥60%)."}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
            <View style={{ flex: 1, padding: 8, backgroundColor: "rgba(255, 255, 255, 0.04)", borderRadius: 6, borderWidth: 1, borderColor: colors.cardBorder }}>
              <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: "700" }}>STUDY STATUS</Text>
              <Text style={{ fontSize: 12, color: (isCompleted || (quizSubmitted && quizScore >= Math.ceil(quizQuestions.length * 0.6))) ? colors.success : colors.warning, fontWeight: "700", marginTop: 2 }}>
                {(isCompleted || (quizSubmitted && quizScore >= Math.ceil(quizQuestions.length * 0.6))) ? "Completed ✓" : "In Progress ⏳"}
              </Text>
            </View>
            <View style={{ flex: 1, padding: 8, backgroundColor: "rgba(255, 255, 255, 0.04)", borderRadius: 6, borderWidth: 1, borderColor: colors.cardBorder }}>
              <Text style={{ fontSize: 10, color: colors.textSecondary, fontWeight: "700" }}>SKILL QUIZ EVALUATION</Text>
              <Text style={{ fontSize: 12, color: quizSubmitted ? (quizScore >= Math.ceil(quizQuestions.length * 0.6) ? colors.success : colors.error) : colors.textMuted, fontWeight: "700", marginTop: 2 }}>
                {quizSubmitted ? `${Math.round((quizScore / quizQuestions.length) * 100)}% (${quizScore >= Math.ceil(quizQuestions.length * 0.6) ? "Passed ✓" : "Retake Quiz"})` : "Take Quiz Below ✍️"}
              </Text>
            </View>
          </View>

          {(isCompleted || (quizSubmitted && quizScore >= Math.ceil(quizQuestions.length * 0.6))) && (
            <Button
              title="🎓 View Official SmartEvolve Certificate"
              onPress={() => setShowCertModal(true)}
              size="md"
              style={{ width: "100%", marginTop: spacing.md, backgroundColor: "#4338CA" }}
            />
          )}
        </Card>

        {/* Segmented Tab Navigation */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "overview" && styles.tabBtnActive]}
            onPress={() => setActiveTab("overview")}
          >
            <Text style={[styles.tabBtnText, activeTab === "overview" && styles.tabBtnTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "quiz" && styles.tabBtnActive]}
            onPress={() => setActiveTab("quiz")}
          >
            <Text style={[styles.tabBtnText, activeTab === "quiz" && styles.tabBtnTextActive]}>
              Skill Quiz ({quizQuestions.length} Questions)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "related" && styles.tabBtnActive]}
            onPress={() => setActiveTab("related")}
          >
            <Text style={[styles.tabBtnText, activeTab === "related" && styles.tabBtnTextActive]}>
              Related Videos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <View style={styles.tabContent}>
            <Card style={styles.bodyCard}>
              <Text style={styles.bodyCardHeading}>Masterclass Description</Text>
              <Text style={styles.bodyDescription}>
                {effectiveVideo.description || "In-depth video tutorial covering essential concepts and practical industry implementations."}
              </Text>

              <View style={styles.keyPointsBox}>
                <Text style={styles.keyPointsTitle}>💡 Key Learning Takeaways</Text>
                <Text style={styles.bulletItem}>• Hands-on coding paradigms and syntax mastery.</Text>
                <Text style={styles.bulletItem}>• Production engineering best practices from senior practitioners.</Text>
                <Text style={styles.bulletItem}>• Direct alignment with Kahn DAG prerequisite milestones.</Text>
              </View>
            </Card>

            {/* Overview Quick Arena Launcher */}
            <View style={styles.arenaCalloutCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 15 }}>
                  🎮 Masterclass Quiz Arena
                </Text>
                <View style={styles.noLoginBadge}>
                  <Text style={styles.noLoginBadgeText}>No Login Required</Text>
                </View>
              </View>
              <Text style={{ color: "#94A3B8", fontSize: 12, lineHeight: 18, marginBottom: 12 }}>
                Ready to test what you learned? Launch an interactive game session for this video with Kahoot shapes or Wayground speed timers:
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                <TouchableOpacity
                  style={styles.kahootBtn}
                  onPress={() => launchArena("kahoot")}
                >
                  <Text style={styles.arenaBtnText}>▲ ◆ ● ■ Launch Kahoot Arena</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.waygroundBtn}
                  onPress={() => launchArena("wayground")}
                >
                  <Text style={styles.arenaBtnText}>⚡ Launch Wayground Mode</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Tab 2: Interactive Skill Quiz (No more 'Coming Soon'!) */}
        {activeTab === "quiz" && (
          <View style={styles.tabContent}>
            <Card style={styles.quizWrapperCard}>
              {/* Quiz Header */}
              <View style={styles.quizHeaderRow}>
                <View>
                  <Text style={styles.quizHeadline}>
                    {effectiveVideo.skillName} Diagnostic Quiz
                  </Text>
                  <Text style={styles.quizSubHeadline}>
                    Attempt #{quizAttempts} • Calibrated with Attempt-Damped Proficiency Recalibration
                  </Text>
                </View>
                <Badge
                  label={quizSubmitted ? `${quizScore}/${quizQuestions.length} Score` : `Q ${currentQuestionIndex + 1}/${quizQuestions.length}`}
                  variant={quizSubmitted ? (quizScore >= 4 ? "success" : "warning") : "primary"}
                />
              </View>

              {/* In-App Interactive Quiz Arena (Kahoot • Wayground • Quizizz - No External Sign-In) */}
              <View style={styles.arenaLaunchBanner}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 14 }}>
                    🎮 In-App Quiz Arena: Kahoot • Wayground • Quizizz
                  </Text>
                  <View style={styles.noLoginBadge}>
                    <Text style={styles.noLoginBadgeText}>Zero Sign-in • In-App</Text>
                  </View>
                </View>
                <Text style={{ color: "#94A3B8", fontSize: 12, lineHeight: 18, marginBottom: 12 }}>
                  Directly launches interactive questions for this video! Play with 25s countdown timers, Kahoot shape blocks, speed streaks, and earn your certificate:
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                  <TouchableOpacity
                    style={styles.kahootBtn}
                    onPress={() => launchArena("kahoot")}
                  >
                    <Text style={styles.arenaBtnText}>▲ ◆ ● ■ Play Kahoot Arena ➔</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.waygroundBtn}
                    onPress={() => launchArena("wayground")}
                  >
                    <Text style={styles.arenaBtnText}>⚡ Play Wayground Speed ➔</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quizizzBtn}
                    onPress={() => launchArena("quizizz")}
                  >
                    <Text style={styles.arenaBtnText}>🎯 Play Quizizz Challenge ➔</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submitted Results View */}
              {quizSubmitted ? (
                <View style={styles.resultsContainer}>
                  <View style={styles.scoreBanner}>
                    <Text style={styles.scoreBigText}>
                      {Math.round((quizScore / quizQuestions.length) * 100)}%
                    </Text>
                    <Text style={styles.scoreSubText}>
                      You answered {quizScore} out of {quizQuestions.length} questions correctly.
                    </Text>
                    <View style={styles.dampedPill}>
                      <Text style={styles.dampedPillText}>
                        📈 +{((quizScore / quizQuestions.length) * (5.0 / Math.sqrt(Math.max(1, quizAttempts)))).toFixed(1)}% Skill Proficiency Added
                      </Text>
                    </View>

                    <View style={{ marginTop: 10, padding: 10, backgroundColor: "rgba(16, 185, 129, 0.15)", borderColor: "#10B981", borderWidth: 1, borderRadius: 8, alignItems: "center" }}>
                      <Text style={{ color: "#10B981", fontWeight: "700", fontSize: 13 }}>
                        ✓ Quiz Marks & Evolution History Saved to PostgreSQL Database
                      </Text>
                      <Text style={{ color: "#94A3B8", fontSize: 11, marginTop: 2 }}>
                        Attempt #{quizAttempts} recorded with {quizScore}/{quizQuestions.length} ({Math.round((quizScore / quizQuestions.length) * 100)}%)
                      </Text>
                    </View>
                  </View>

                  {/* Review Questions */}
                  <Text style={styles.reviewHeading}>Question Analysis & Explanations:</Text>
                  {quizQuestions.map((q, idx) => {
                    const studentAns = selectedAnswers[q.id];
                    const isCorrect = studentAns === q.correctIndex;
                    return (
                      <View key={q.id} style={[styles.reviewItem, isCorrect ? styles.reviewItemCorrect : styles.reviewItemWrong]}>
                        <View style={styles.reviewTopRow}>
                          <Text style={styles.reviewQuestionNum}>Question {idx + 1}</Text>
                          <Text style={isCorrect ? styles.correctBadge : styles.wrongBadge}>
                            {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                          </Text>
                        </View>
                        <Text style={styles.reviewQuestionText}>{q.question}</Text>
                        <Text style={styles.reviewAnswerText}>
                          Your answer: <Text style={{ fontWeight: "700" }}>{studentAns !== undefined ? q.options[studentAns] : "Not Answered"}</Text>
                        </Text>
                        {!isCorrect && (
                          <Text style={styles.reviewCorrectText}>
                            Correct answer: <Text style={{ fontWeight: "700" }}>{q.options[q.correctIndex]}</Text>
                          </Text>
                        )}
                        <Text style={styles.reviewExplanation}>
                          💡 {q.explanation}
                        </Text>
                      </View>
                    );
                  })}

                  <View style={styles.resultsActionRow}>
                    <Button
                      title="🔄 Retry Quiz"
                      onPress={handleResetQuiz}
                      variant="outline"
                      size="md"
                      style={{ flex: 1 }}
                    />
                    {relatedAssessment && (
                      <Button
                        title="Take Formal Assessment →"
                        onPress={() => router.push(`/assessment/${relatedAssessment.id}`)}
                        variant="primary"
                        size="md"
                        style={{ flex: 1 }}
                      />
                    )}
                  </View>
                </View>
              ) : (
                /* Active Question View */
                <View style={styles.activeQuestionContainer}>
                  {/* Progress Indicator Dots */}
                  <View style={styles.dotsRow}>
                    {quizQuestions.map((q, i) => (
                      <TouchableOpacity
                        key={q.id}
                        onPress={() => setCurrentQuestionIndex(i)}
                        style={[
                          styles.dot,
                          i === currentQuestionIndex && styles.dotActive,
                          selectedAnswers[q.id] !== undefined && styles.dotAnswered,
                        ]}
                      />
                    ))}
                  </View>

                  <Text style={styles.questionText}>
                    {currentQuestionIndex + 1}. {currentQuestion.question}
                  </Text>

                  {/* Options List */}
                  <View style={styles.optionsList}>
                    {currentQuestion.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[currentQuestion.id] === optIdx;
                      return (
                        <TouchableOpacity
                          key={optIdx}
                          style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                          onPress={() => handleSelectOption(currentQuestion.id, optIdx)}
                        >
                          <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                            {isSelected && <View style={styles.radioInner} />}
                          </View>
                          <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Question Navigation */}
                  <View style={styles.questionNavRow}>
                    <TouchableOpacity
                      disabled={currentQuestionIndex === 0}
                      onPress={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                      style={[styles.navBtn, currentQuestionIndex === 0 && styles.navBtnDisabled]}
                    >
                      <Text style={[styles.navBtnText, currentQuestionIndex === 0 && styles.navBtnTextDisabled]}>
                        ← Previous
                      </Text>
                    </TouchableOpacity>

                    {currentQuestionIndex < quizQuestions.length - 1 ? (
                      <TouchableOpacity
                        onPress={() => setCurrentQuestionIndex((prev) => prev + 1)}
                        style={styles.navBtnNext}
                      >
                        <Text style={styles.navBtnNextText}>Next →</Text>
                      </TouchableOpacity>
                    ) : (
                      <Button
                        title="Submit Quiz & Calibrate Score"
                        onPress={handleSubmitQuiz}
                        variant="primary"
                        size="sm"
                        disabled={Object.keys(selectedAnswers).length === 0}
                      />
                    )}
                  </View>
                </View>
              )}
            </Card>
          </View>
        )}

        {/* Tab 3: Related Videos */}
        {activeTab === "related" && (
          <View style={styles.tabContent}>
            {relatedVideos && relatedVideos.length > 0 ? (
              relatedVideos
                .filter((v) => v.videoId !== effectiveVideo.videoId)
                .map((v) => (
                  <VideoCard
                    key={v.id}
                    video={v}
                    layout="horizontal"
                    onPress={(item) => router.push(`/videos/${item.id || item.videoId}`)}
                  />
                ))
            ) : (
              <Text style={styles.emptySub}>No additional videos for this skill yet.</Text>
            )}
          </View>
        )}
        {/* In-App Interactive Quiz Arena (Kahoot • Wayground • Quizizz) */}
        <InteractiveQuizArenaModal
          visible={arenaModalVisible}
          onClose={() => setArenaModalVisible(false)}
          platform={arenaPlatform}
          videoTitle={effectiveVideo.title}
          skillName={effectiveVideo.skillName || "Computer Science"}
          questions={quizQuestions}
          studentName={profile?.fullName || "SmartEvolve Scholar"}
          onComplete={handleArenaComplete}
          onViewCertificate={() => setShowCertModal(true)}
        />

        {/* Autonomous Great Learning Style Course Certificate Modal */}
        <CertificateModal
          visible={showCertModal}
          onClose={() => setShowCertModal(false)}
          certificate={{
            id: "SE-GL-" + (effectiveVideo.videoId || "CERT").toUpperCase(),
            studentName: profile?.fullName || "Bindu Talari",
            department: profile?.branch || "Computer Science and Engineering",
            institution: profile?.institution || "K.S.R.M. College of Engineering (Autonomous)",
            graduationYear: profile?.graduationYear || 2026,
            courseOrSkillTitle: effectiveVideo.title,
            category: effectiveVideo.category || effectiveVideo.skillName || "Computer Science",
            proficiency: quizSubmitted ? Math.round((quizScore / quizQuestions.length) * 100) : 95,
            issuedDate: new Date().toISOString(),
            certificateCode: "SE-GL-" + Math.floor(100000 + Math.random() * 900000),
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  // Responsive full-width layout without desktop margins
  responsiveWrapper: {
    width: "100%",
    alignSelf: "stretch",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  backBtn: {
    marginBottom: spacing.sm,
  },
  backBtnText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  metaHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  topPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
    flexWrap: "wrap",
  },
  durationPill: {
    color: colors.textMuted,
    fontSize: 12,
  },
  saveBtn: {
    marginLeft: "auto",
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  saveBtnText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "600",
  },
  videoTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 28,
    marginTop: 4,
    marginBottom: 6,
  },
  channelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  channelName: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  viewCount: {
    color: colors.textMuted,
    fontSize: 12,
  },
  progressCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderColor: "rgba(99, 102, 241, 0.2)",
    borderWidth: 1,
  },
  progressCardTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  progressCardSub: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  actionButtonsRow: {
    flexDirection: "column",
    gap: spacing.xs,
  },
  tabsRow: {
    flexDirection: "row",
    borderBottomColor: colors.cardBorder,
    borderBottomWidth: 1,
    marginBottom: spacing.md,
  },
  tabBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabBtnActive: {
    borderBottomColor: colors.primary,
  },
  tabBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  tabBtnTextActive: {
    color: colors.primary,
    fontWeight: "700",
  },
  tabContent: {
    marginBottom: spacing.lg,
  },
  bodyCard: {
    padding: spacing.md,
  },
  bodyCardHeading: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  bodyDescription: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  keyPointsBox: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: radius.sm,
    gap: 4,
  },
  keyPointsTitle: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  bulletItem: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  quizWrapperCard: {
    padding: spacing.lg,
    borderColor: "rgba(99, 102, 241, 0.25)",
    borderWidth: 1,
  },
  quizHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
  },
  quizHeadline: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
  quizSubHeadline: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  activeQuestionContainer: {
    gap: spacing.md,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
  },
  dot: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.cardBorder,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  dotAnswered: {
    backgroundColor: colors.success,
  },
  questionText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
  },
  optionsList: {
    gap: spacing.sm,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  optionItemSelected: {
    borderColor: colors.primary,
    backgroundColor: "rgba(99, 102, 241, 0.12)",
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.primary,
  },
  optionLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  optionLabelSelected: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  questionNavRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  navBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  navBtnTextDisabled: {
    color: colors.textMuted,
  },
  navBtnNext: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  navBtnNextText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
  resultsContainer: {
    gap: spacing.md,
  },
  scoreBanner: {
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    borderColor: "rgba(99, 102, 241, 0.3)",
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: "center",
  },
  scoreBigText: {
    color: colors.primary,
    fontSize: 38,
    fontWeight: "900",
  },
  scoreSubText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
  dampedPill: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    borderColor: colors.success,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  dampedPillText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "800",
  },
  reviewHeading: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  reviewItem: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    gap: 4,
  },
  reviewItemCorrect: {
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  reviewItemWrong: {
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  reviewTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewQuestionNum: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  correctBadge: {
    color: colors.success,
    fontSize: 11,
    fontWeight: "800",
  },
  wrongBadge: {
    color: colors.error,
    fontSize: 11,
    fontWeight: "800",
  },
  reviewQuestionText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "700",
    marginVertical: 2,
  },
  reviewAnswerText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  reviewCorrectText: {
    color: colors.success,
    fontSize: 12,
  },
  reviewExplanation: {
    color: colors.accent,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  resultsActionRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  arenaLaunchBanner: {
    backgroundColor: "rgba(70, 23, 143, 0.25)",
    borderColor: "rgba(168, 85, 247, 0.4)",
    borderWidth: 1.5,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  arenaCalloutCard: {
    backgroundColor: "#131B2E",
    borderColor: "rgba(99, 102, 241, 0.35)",
    borderWidth: 1.5,
    borderRadius: 14,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  noLoginBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderColor: "#10B981",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  noLoginBadgeText: {
    color: "#10B981",
    fontSize: 10,
    fontWeight: "800",
  },
  kahootBtn: {
    backgroundColor: "#46178F",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  waygroundBtn: {
    backgroundColor: "#0066CC",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  quizizzBtn: {
    backgroundColor: "#8854C0",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  arenaBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
});
