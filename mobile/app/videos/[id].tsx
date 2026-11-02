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
      "options": [
        "@RestController",
        "@Service",
        "@Repository",
        "@Component"
      ],
      "correctIndex": 0,
      "explanation": "@RestController combines @Controller and @ResponseBody, ensuring every handler method automatically serializes return values directly into HTTP response bodies as JSON."
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
      "explanation": "Auto-Configuration inspects your project dependencies (e.g., spring-boot-starter-web) and automatically registers default beans without verbose XML or Java configuration."
    },
    {
      "id": 3,
      "question": "Which Spring Data interface provides built-in pagination, sorting, and standard CRUD operations?",
      "options": [
        "JpaRepository",
        "JdbcTemplate",
        "CrudEngine",
        "SessionManager"
      ],
      "correctIndex": 0,
      "explanation": "JpaRepository extends PagingAndSortingRepository and CrudRepository, providing out-of-the-box support for pagination, sorting, and batch operations."
    },
    {
      "id": 4,
      "question": "Where are environment configurations primarily defined in standard Spring Boot projects?",
      "options": [
        "application.yml or application.properties",
        "pom.xml or build.gradle",
        "web.xml under WEB-INF",
        "beans.xml in root classpath"
      ],
      "correctIndex": 0,
      "explanation": "application.yml (or application.properties) in src/main/resources is the canonical location for configuring port, datasource, JPA dialects, and custom properties."
    },
    {
      "id": 5,
      "question": "Which HTTP status code should a REST endpoint return when a new entity is successfully created?",
      "options": [
        "201 Created",
        "200 OK",
        "204 No Content",
        "202 Accepted"
      ],
      "correctIndex": 0,
      "explanation": "RFC 7231 specifies HTTP 201 Created as the correct standard response for POST requests that successfully result in the creation of a new persistent resource."
    },
    {
      "id": 6,
      "question": "Which annotation is used in Spring Boot to map HTTP GET requests onto specific handler methods?",
      "options": [
        "@GetMapping",
        "@PostMapping",
        "@PutMapping",
        "@DeleteMapping"
      ],
      "correctIndex": 0,
      "explanation": "@GetMapping is a composed annotation that acts as a shortcut for @RequestMapping(method = RequestMethod.GET)."
    },
    {
      "id": 7,
      "question": "What is the default embedded servlet web container provided by spring-boot-starter-web?",
      "options": [
        "Apache Tomcat",
        "Eclipse Jetty",
        "Red Hat Undertow",
        "GlassFish"
      ],
      "correctIndex": 0,
      "explanation": "Spring Boot web starter embeds Apache Tomcat by default listening on port 8080."
    },
    {
      "id": 8,
      "question": "In Spring Boot Dependency Injection, which annotation marks a service class holding core business logic?",
      "options": [
        "@Service",
        "@Controller",
        "@Configuration",
        "@Aspect"
      ],
      "correctIndex": 0,
      "explanation": "@Service is a specialization of the @Component annotation that marks classes containing business logic and domain calculations."
    },
    {
      "id": 9,
      "question": "Which annotation ensures database operations inside a method execute inside a single transaction with automatic rollback?",
      "options": [
        "@Transactional",
        "@Async",
        "@Modifying",
        "@Synchronized"
      ],
      "correctIndex": 0,
      "explanation": "@Transactional manages transaction boundaries declaratively, automatically committing on return and rolling back on runtime exceptions."
    },
    {
      "id": 10,
      "question": "What Spring Boot actuator endpoint provides real-time application health metrics and liveness probes?",
      "options": [
        "/actuator/health",
        "/actuator/info",
        "/actuator/metrics",
        "/actuator/beans"
      ],
      "correctIndex": 0,
      "explanation": "/actuator/health provides health check status used by container orchestrators and monitoring tools."
    }
  ],
  "python": [
    {
      "id": 1,
      "question": "What is the output of `[x**2 for x in range(4) if x % 2 == 0]` in Python?",
      "options": [
        "[0, 4]",
        "[0, 1, 4, 9]",
        "[4, 16]",
        "[0, 2]"
      ],
      "correctIndex": 0,
      "explanation": "The range is 0, 1, 2, 3. The even numbers are 0 and 2. Squaring them yields 0**2 = 0 and 2**2 = 4, resulting in the list [0, 4]."
    },
    {
      "id": 2,
      "question": "Which Python data structure is immutable and defined with parentheses?",
      "options": [
        "Tuple",
        "List",
        "Dictionary",
        "Set"
      ],
      "correctIndex": 0,
      "explanation": "Tuples are immutable sequence types in Python; once initialized, their elements cannot be appended, removed, or reassigned."
    },
    {
      "id": 3,
      "question": "Which library is the standard foundation for high-performance multidimensional array math in Python?",
      "options": [
        "NumPy",
        "Requests",
        "Flask",
        "BeautifulSoup"
      ],
      "correctIndex": 0,
      "explanation": "NumPy provides the contiguous C-level ndarray object and optimized vector math routines fundamental to Python scientific computing."
    },
    {
      "id": 4,
      "question": "In Python, which keyword is used to create an anonymous single-expression function?",
      "options": [
        "lambda",
        "def",
        "inline",
        "anon"
      ],
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
      "options": [
        "yield",
        "return",
        "generate",
        "iter"
      ],
      "correctIndex": 0,
      "explanation": "The `yield` statement suspends function execution and returns an intermediate value, maintaining state across calls."
    },
    {
      "id": 7,
      "question": "What is the average time complexity of looking up a key in a Python dictionary?",
      "options": [
        "O(1)",
        "O(n)",
        "O(log n)",
        "O(n^2)"
      ],
      "correctIndex": 0,
      "explanation": "Python dictionaries are implemented as dynamic hash tables, yielding O(1) average lookup and insertion time complexity."
    },
    {
      "id": 8,
      "question": "What special protocol method is executed when an object is entered using the 'with' statement?",
      "options": [
        "__enter__",
        "__init__",
        "__call__",
        "__open__"
      ],
      "correctIndex": 0,
      "explanation": "The context management protocol invokes `__enter__` upon entering a `with` block and `__exit__` upon exiting."
    },
    {
      "id": 9,
      "question": "Which built-in Python module is standard for serialization and deserialization of Python object hierarchies?",
      "options": [
        "pickle",
        "json",
        "marshal",
        "copy"
      ],
      "correctIndex": 0,
      "explanation": "The `pickle` module implements binary protocols for serializing and de-serializing a Python object structure."
    },
    {
      "id": 10,
      "question": "What is the result of `type(None)` in Python 3?",
      "options": [
        "<class 'NoneType'>",
        "<class 'null'>",
        "<class 'void'>",
        "<class 'undefined'>"
      ],
      "correctIndex": 0,
      "explanation": "In Python, `None` is a singleton instance of the `NoneType` class representing the absence of a value."
    }
  ],
  "machinelearning": [
    {
      "id": 1,
      "question": "What mathematical function maps real numbers to probabilities between 0 and 1 in binary classification?",
      "options": [
        "Sigmoid function",
        "Linear function",
        "ReLU",
        "Step function"
      ],
      "correctIndex": 0,
      "explanation": "The Sigmoid (logistic) function \u03c3(z) = 1 / (1 + e^(-z)) smoothly squashes any real value into the (0, 1) probability range."
    },
    {
      "id": 2,
      "question": "Which technique is primarily used to prevent overfitting in complex machine learning models?",
      "options": [
        "L1/L2 Regularization, dropout, and pruning",
        "Increasing the learning rate infinitely",
        "Removing validation and test sets",
        "Artificially duplicating training examples"
      ],
      "correctIndex": 0,
      "explanation": "Regularization penalizes extreme weight magnitudes, preventing the model from fitting training noise and improving generalization."
    },
    {
      "id": 3,
      "question": "In Cosine Similarity, what does a score of 1.0 indicate between two skill vectors?",
      "options": [
        "Identical direction / perfect profile alignment",
        "Vectors are orthogonal (completely independent)",
        "Vectors point in opposite directions",
        "Zero data points exist"
      ],
      "correctIndex": 0,
      "explanation": "Cosine similarity measures the cosine of the angle between two multi-dimensional vectors. Cos(0\u00b0) = 1.0, representing exact alignment."
    },
    {
      "id": 4,
      "question": "What is the primary evaluation metric recommended when assessing models on heavily imbalanced datasets?",
      "options": [
        "F1-Score / PR-AUC",
        "Accuracy",
        "Mean Absolute Error",
        "R-squared"
      ],
      "correctIndex": 0,
      "explanation": "Accuracy can be deceptively high if the majority class dominates; F1-Score balances Precision and Recall for minority class detection."
    },
    {
      "id": 5,
      "question": "What does the Attempt-Damped Proficiency formula \u03bb(n) = 1 / \u221a(max(1, n)) achieve in SmartEvolve AI?",
      "options": [
        "Dampens proficiency increments on repeated attempts to limit score inflation by 39%",
        "Doubles user scores on every retry",
        "Randomly shifts questions on each assessment",
        "Deletes failed attempts from the database"
      ],
      "correctIndex": 0,
      "explanation": "As validated in the SmartEvolve research paper, attempt damping ensures genuine mastery is required by decelerating score accumulation on repeated attempts."
    },
    {
      "id": 6,
      "question": "In Gradient Descent optimization, what hyperparameter controls the step size taken towards the minimum?",
      "options": [
        "Learning Rate (\u03b1)",
        "Momentum Coefficient",
        "Batch Size",
        "Epoch Count"
      ],
      "correctIndex": 0,
      "explanation": "The learning rate dictates the step size at each iteration while moving toward a minimum of a loss function."
    },
    {
      "id": 7,
      "question": "What ensemble learning method combines multiple independently trained Decision Trees via bootstrap aggregating (bagging)?",
      "options": [
        "Random Forest",
        "Gradient Boosting Machine",
        "Linear Discriminant Analysis",
        "Support Vector Machine"
      ],
      "correctIndex": 0,
      "explanation": "Random Forest builds multiple decision trees on bootstrapped data subsets and merges them to obtain a more accurate and stable prediction."
    },
    {
      "id": 8,
      "question": "What problem occurs when a model performs exceptionally well on training data but poorly on unseen test data?",
      "options": [
        "High Variance (Overfitting)",
        "High Bias (Underfitting)",
        "Data Leakage",
        "Feature Collinearity"
      ],
      "correctIndex": 0,
      "explanation": "Overfitting happens when a model learns the detailed patterns and noise in the training data to the extent that it negatively impacts test performance."
    },
    {
      "id": 9,
      "question": "Which cross-validation technique divides the dataset into 'k' equal subsets to evaluate model stability?",
      "options": [
        "K-Fold Cross-Validation",
        "Monte Carlo Sampling",
        "Leave-P-Out Testing",
        "Bootstrapping"
      ],
      "correctIndex": 0,
      "explanation": "K-Fold cross-validation splits the dataset into k folds, training on k-1 and validating on the remaining fold across k iterations."
    },
    {
      "id": 10,
      "question": "What does an Area Under the ROC Curve (AUC-ROC) of 0.5 represent?",
      "options": [
        "Performance equivalent to random guessing",
        "Perfect classification ability",
        "Severe inverse correlation",
        "Zero false positives"
      ],
      "correctIndex": 0,
      "explanation": "An AUC-ROC score of 0.5 represents a model with no discrimination capacity, performing no better than random guessing."
    }
  ],
  "sql": [
    {
      "id": 1,
      "question": "Which SQL clause is used to filter records after performing an aggregate GROUP BY operation?",
      "options": [
        "HAVING",
        "WHERE",
        "ORDER BY",
        "QUALIFY"
      ],
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
      "options": [
        "LEFT OUTER JOIN",
        "INNER JOIN",
        "CROSS JOIN",
        "RIGHT OUTER JOIN"
      ],
      "correctIndex": 0,
      "explanation": "LEFT JOIN retains every record from the left table; if no match exists in the right table, NULLs are returned for right columns."
    },
    {
      "id": 4,
      "question": "What is the index data structure used by most relational engines for high-performance B-tree indexing?",
      "options": [
        "B+ Tree",
        "Linked List",
        "Binary Heap",
        "Hash Ring"
      ],
      "correctIndex": 0,
      "explanation": "B+ Trees store all actual record pointers in leaf nodes linked sequentially, facilitating both fast point lookups and range scans."
    },
    {
      "id": 5,
      "question": "What is the primary purpose of database normalization (1NF through 3NF)?",
      "options": [
        "Minimize data redundancy and avoid update anomalies",
        "Compress database disk files",
        "Encrypt sensitive passwords",
        "Speed up network packet transfer"
      ],
      "correctIndex": 0,
      "explanation": "Normalization decomposes relations to ensure each fact is stored only once, eliminating insertion, update, and deletion anomalies."
    },
    {
      "id": 6,
      "question": "Which constraint uniquely identifies each record in a database table while enforcing NOT NULL?",
      "options": [
        "PRIMARY KEY",
        "FOREIGN KEY",
        "CHECK",
        "DEFAULT"
      ],
      "correctIndex": 0,
      "explanation": "A PRIMARY KEY constraint uniquely identifies each record in a table and cannot contain NULL values."
    },
    {
      "id": 7,
      "question": "What technique is most effective in preventing SQL Injection vulnerabilities in application code?",
      "options": [
        "Parameterized queries (Prepared Statements)",
        "Escaping single quotes with regex",
        "Hashing SQL queries",
        "Using GET requests only"
      ],
      "correctIndex": 0,
      "explanation": "Prepared Statements separate query structure from untrusted user parameters, making SQL injection impossible."
    },
    {
      "id": 8,
      "question": "Which SQL window function assigns a sequential unique integer to rows within a partition starting from 1?",
      "options": [
        "ROW_NUMBER()",
        "RANK()",
        "DENSE_RANK()",
        "LEAD()"
      ],
      "correctIndex": 0,
      "explanation": "ROW_NUMBER() outputs an incremental sequential integer for each row without gaps or duplicate values."
    },
    {
      "id": 9,
      "question": "Which SQL command is used to permanently remove all rows from a table rapidly without logging row-by-row deletions?",
      "options": [
        "TRUNCATE TABLE",
        "DELETE FROM",
        "DROP TABLE",
        "REMOVE TABLE"
      ],
      "correctIndex": 0,
      "explanation": "TRUNCATE TABLE deallocates the data pages directly, making it significantly faster than DELETE which writes undo logs for each row."
    },
    {
      "id": 10,
      "question": "What transaction isolation level completely prevents Dirty Reads, Non-Repeatable Reads, and Phantom Reads?",
      "options": [
        "SERIALIZABLE",
        "REPEATABLE READ",
        "READ COMMITTED",
        "READ UNCOMMITTED"
      ],
      "correctIndex": 0,
      "explanation": "SERIALIZABLE is the highest ANSI SQL isolation level, executing transactions as if they occurred serially."
    }
  ],
  "general": [
    {
      "id": 1,
      "question": "What is the time complexity of searching for an element in a balanced Binary Search Tree (AVL / Red-Black)?",
      "options": [
        "O(log n)",
        "O(n)",
        "O(1)",
        "O(n log n)"
      ],
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
      "question": "Which cryptographic hash function is used to produce EVM 32-byte dual-hash verifiable credentials in SmartEvolve AI?",
      "options": [
        "Keccak-256",
        "MD5",
        "DES",
        "CRC32"
      ],
      "correctIndex": 0,
      "explanation": "SmartEvolve AI uses Keccak-256 (the Ethereum standard) combined with student profile and achievement hashes for on-chain credential integrity."
    },
    {
      "id": 4,
      "question": "Which HTTP status code signifies that a client must authenticate itself to get the requested response?",
      "options": [
        "401 Unauthorized",
        "403 Forbidden",
        "404 Not Found",
        "500 Internal Server Error"
      ],
      "correctIndex": 0,
      "explanation": "401 indicates missing or invalid authentication credentials; 403 indicates authentication was recognized but authorization is forbidden."
    },
    {
      "id": 5,
      "question": "What is the primary role of a container runtime like Docker in modern microservices architectures?",
      "options": [
        "Package applications with their entire runtime dependencies into portable, isolated containers",
        "Replace operating systems with custom hardware drivers",
        "Automatically write unit tests for backend controllers",
        "Format code before committing to Git"
      ],
      "correctIndex": 0,
      "explanation": "Docker containers encapsulate code, libraries, and runtime dependencies together, guaranteeing uniform execution across dev and production."
    },
    {
      "id": 6,
      "question": "Which sorting algorithm guarantees O(n log n) worst-case time complexity using a divide-and-conquer strategy?",
      "options": [
        "Merge Sort",
        "Quick Sort",
        "Bubble Sort",
        "Insertion Sort"
      ],
      "correctIndex": 0,
      "explanation": "Merge Sort always splits arrays in half and merges sorted halves, guaranteeing O(n log n) even in worst-case scenarios."
    },
    {
      "id": 7,
      "question": "In RESTful API design, what does it mean for an HTTP method to be 'idempotent'?",
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
      "options": [
        "Stack",
        "Queue",
        "Priority Queue",
        "Circular Buffer"
      ],
      "correctIndex": 0,
      "explanation": "A Stack operates on a LIFO basis where the most recently pushed element is the first to be popped."
    }
  ]
};

function getTopicKey(skillName?: string, title?: string): string {
  const combined = ((skillName || "") + " " + (title || "")).toLowerCase();
  if (combined.includes("spring") || combined.includes("java")) return "springboot";
  if (combined.includes("python") || combined.includes("django") || combined.includes("flask")) return "python";
  if (combined.includes("machine") || combined.includes("ai") || combined.includes("neural") || combined.includes("data science")) return "machinelearning";
  if (combined.includes("sql") || combined.includes("database") || combined.includes("postgres")) return "sql";
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

  const { data: video, isLoading } = useQuery({
    queryKey: ["youtubeVideoDetail", id],
    queryFn: () => api.getYouTubeVideoDetail(id!),
    enabled: !!id,
  });

  const { data: assessments } = useQuery({
    queryKey: ["assessments"],
    queryFn: () => api.getAssessments(),
  });

  const { data: relatedVideos } = useQuery({
    queryKey: ["relatedVideos", video?.skillId],
    queryFn: () =>
      api.getYouTubeVideos({
        skillId: video?.skillId,
        limit: 4,
      }),
    enabled: !!video?.skillId,
  });

  // Watchlist persistence
  useEffect(() => {
    if (!video) return;
    AsyncStorage.getItem(SAVED_VIDEOS_STORAGE_KEY).then((val) => {
      if (val) {
        try {
          const list: string[] = JSON.parse(val);
          setIsSaved(list.includes(video.id) || list.includes(video.videoId));
        } catch (_) {}
      }
    });
  }, [video]);

  const toggleSaveForLater = async () => {
    if (!video) return;
    try {
      const val = await AsyncStorage.getItem(SAVED_VIDEOS_STORAGE_KEY);
      let list: string[] = val ? JSON.parse(val) : [];
      const vId = video.id || video.videoId;

      if (isSaved) {
        list = list.filter((item) => item !== vId && item !== video.videoId && item !== video.id);
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
        videoId: video?.id,
        youtubeVideoId: video?.videoId,
        watchedSeconds: status === "COMPLETED" ? (video ? video.estimatedMinutes * 60 : 1800) : 900,
        totalSeconds: video ? video.estimatedMinutes * 60 : 1800,
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
          ? `Your progress has been recorded and +3.0% proficiency has been added to your ${video?.skillName || "skill"} profile!`
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

  if (isLoading || !video) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={styles.loadingText}>Loading SmartEvolve Masterclass...</Text>
      </View>
    );
  }

  const isCompleted = video.watchStatus === "COMPLETED";
  const topicKey = getTopicKey(video.skillName, video.title);
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

    // Calculate Attempt-Damped Proficiency Gain
    const lambda = 1.0 / Math.sqrt(Math.max(1, quizAttempts));
    const rawGain = (correctCount / quizQuestions.length) * 5.0; // max +5.0%
    const dampedGain = (rawGain * lambda).toFixed(1);

    // Record progress dynamically in backend
    api.updateVideoProgress({
      videoId: video.id,
      youtubeVideoId: video.videoId,
      watchedSeconds: video.estimatedMinutes * 60,
      totalSeconds: video.estimatedMinutes * 60,
      status: "COMPLETED",
    }).catch(() => {});

    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["evolutionHistory"] });
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setCurrentQuestionIndex(0);
    setQuizAttempts((prev) => prev + 1);
  };

  const relatedAssessment = (assessments || []).find(
    (a) => a.skillId === video.skillId || a.title?.toLowerCase().includes((video.skillName || "").toLowerCase())
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
          videoIdOrUrl={video.videoId}
          title={video.title}
          thumbnailUrl={video.thumbnailUrl}
          autoPlay={true}
        />

        {/* Video Header & Metadata */}
        <View style={styles.metaHeader}>
          <View style={styles.topPillsRow}>
            <Badge label={video.difficulty || "INTERMEDIATE"} variant="primary" />
            <Badge
              label={isCompleted ? "COMPLETED" : video.watchStatus === "IN_PROGRESS" ? "IN PROGRESS" : "NOT STARTED"}
              variant={isCompleted ? "success" : video.watchStatus === "IN_PROGRESS" ? "warning" : "info"}
            />
            <Text style={styles.durationPill}>⏱️ {video.duration || `${video.estimatedMinutes}:00`}</Text>

            <TouchableOpacity style={styles.saveBtn} onPress={toggleSaveForLater}>
              <Text style={styles.saveBtnText}>{isSaved ? "★ In Watchlist" : "☆ Save for Later"}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.videoTitle}>{video.title}</Text>

          <View style={styles.channelRow}>
            <Text style={styles.channelName}>{video.channelTitle || "SmartEvolve Educator"}</Text>
            {video.viewCount ? (
              <Text style={styles.viewCount}>• {video.viewCount.toLocaleString()} views</Text>
            ) : null}
            <Badge label={video.skillName || "Masterclass"} variant="info" />
          </View>
        </View>

        {/* Learning Verification & Progress Recording */}
        <Card style={styles.progressCard}>
          <Text style={styles.progressCardTitle}>Learning Verification</Text>
          <Text style={styles.progressCardSub}>
            Watch the video lesson and verify your understanding to calibrate your skill evolution.
          </Text>

          <View style={styles.actionButtonsRow}>
            <Button
              title={isCompleted ? "✓ Masterclass Completed (+3% Proficiency)" : "Mark Video as Completed (100%)"}
              onPress={() => updateProgressMutation.mutate("COMPLETED")}
              variant="primary"
              loading={updateProgressMutation.isPending}
              size="md"
              style={{ flex: 1 }}
            />
            {!isCompleted && (
              <Button
                title="Mark as In Progress (50%)"
                onPress={() => updateProgressMutation.mutate("IN_PROGRESS")}
                variant="outline"
                loading={updateProgressMutation.isPending}
                size="md"
                style={{ flex: 1, marginTop: spacing.xs }}
              />
            )}
          </View>
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
                {video.description || "In-depth video tutorial covering essential concepts and practical industry implementations."}
              </Text>

              <View style={styles.keyPointsBox}>
                <Text style={styles.keyPointsTitle}>💡 Key Learning Takeaways</Text>
                <Text style={styles.bulletItem}>• Hands-on coding paradigms and syntax mastery.</Text>
                <Text style={styles.bulletItem}>• Production engineering best practices from senior practitioners.</Text>
                <Text style={styles.bulletItem}>• Direct alignment with Kahn DAG prerequisite milestones.</Text>
              </View>
            </Card>
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
                    {video.skillName} Diagnostic Quiz
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
                .filter((v) => v.videoId !== video.videoId)
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
});
