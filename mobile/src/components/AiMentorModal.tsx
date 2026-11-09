import React, { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { api } from "../api/client";
import { colors, radius, spacing } from "../theme/colors";
import { Button } from "./Button";

interface AiMentorModalProps {
  visible: boolean;
  onClose: () => void;
}

export type AiProvider = "gemini" | "groq" | "anthropic";

function getIntelligentMentorResponse(userText: string, backendReply?: string): string {
  // If backend provided a custom non-repetitive response, use it:
  if (
    backendReply &&
    !backendReply.includes("focusing on conceptual understanding first") &&
    !backendReply.includes("Check your active Roadmap in the Learn tab to unlock the next milestone") &&
    !backendReply.includes("practical application yields the highest learning retention") &&
    !backendReply.includes("Regarding \"") &&
    backendReply.trim().length > 25
  ) {
    return backendReply.trim();
  }

  const query = userText.toLowerCase().trim();

  // 1. Hot topics / World Trends / News / Tech Evolution
  if (
    query.includes("topic") ||
    query.includes("hot topic") ||
    query.includes("world") ||
    query.includes("trend") ||
    query.includes("news") ||
    query.includes("latest")
  ) {
    return `I'd love to discuss today's hot topics in tech! Right now, some of the biggest movements shaping the industry include:

1. 🤖 Autonomous AI Agents & Real-Time Reasoning:
• Shifting beyond standard text chatbots to autonomous multi-agent pipelines that build, test, and deploy applications.

2. ⚡ Ultra-Fast Edge & Open-Source LLM Inference:
• Massive adoption of Groq LPUs, Llama 3.3, and DeepSeek running locally and on the edge at 1,000+ tokens/second.

3. 🚀 Modern Cloud-Native & Reactive Frameworks:
• Spring Boot 3 with GraalVM native binaries for sub-second startup times, and React 19 server actions for zero-bundle-size backend integration.

4. ⛓️ Decentralized Identity & Verifiable Credentials:
• On-chain cryptographic proofs that verify software engineering proficiency without relying on paper degrees.

Which of these areas are you most curious about? We can dive into practical implications, career impacts, or how you can build hands-on projects with them!`;
  }

  // 2. Greetings & Casual Hello (Handles "Hi", "Hiii", "Hello", "Hey", plus leading conversational intros)
  if (
    query === "hi" ||
    query === "hii" ||
    query === "hiii" ||
    query === "hello" ||
    query === "hey" ||
    query === "heyy" ||
    query === "hola" ||
    query.startsWith("hi ") ||
    query.startsWith("hii ") ||
    query.startsWith("hiii ") ||
    query.startsWith("hello ") ||
    query.startsWith("hey ") ||
    query.startsWith("heyy ") ||
    query.includes("good morning") ||
    query.includes("good afternoon") ||
    query.includes("good evening") ||
    query === "sup" ||
    query.includes("what's up") ||
    query.includes("how are you")
  ) {
    return `Hello! 👋 Great to connect with you! I'm your dedicated SmartEvolve AI Career & Technical Mentor.

I'm here to help you accelerate your tech career and master challenging engineering concepts. You can ask me about:

• 🚀 Full-Stack & Backend (Spring Boot, Node.js, React, APIs)
• 🧠 AI / ML & Python Data Systems
• 🎯 Technical Interview Prep & Core DSA Mastery
• 💼 Portfolio Projects that stand out to tech recruiters
• ⛓️ On-Chain Verifiable Credentials & Smart Contract Certification

What would you like to explore or work on today?`;
  }

  // 2. Spring Boot / Java / REST APIs
  if (
    query.includes("spring") ||
    query.includes("java") ||
    query.includes("jpa") ||
    query.includes("hibernate") ||
    query.includes("rest api")
  ) {
    return `Spring Boot & Enterprise Java Architecture Blueprint:

1. Core Architecture:
• Separation of Concerns: Controller (@RestController) ➔ Service Layer (@Service) ➔ Data Access (@Repository) ➔ Entity (@Entity).
• Dependency Injection (@Autowired / Constructor Injection) decouples business logic for clean unit testing.

2. Database Persistence with JPA/Hibernate:
• Spring Data JPA provides automated CRUD operations with JpaRepository<Entity, ID>.
• Always use @Transactional on service methods modifying state to guarantee ACID compliance.

3. RESTful API Best Practices:
• Use proper HTTP verbs (GET, POST, PUT, DELETE, PATCH) with standard status codes (200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Error).
• Implement global exception handling using @ControllerAdvice and @ExceptionHandler.

4. Next Step:
Check out the Spring Boot masterclass videos in the Learn tab and complete the certification quiz to mint your verified credential!`;
  }

  // 3. React / Next.js / Frontend / TypeScript
  if (
    query.includes("react") ||
    query.includes("nextjs") ||
    query.includes("next.js") ||
    query.includes("frontend") ||
    query.includes("typescript") ||
    query.includes("javascript")
  ) {
    return `Modern React & Frontend Engineering Mastery:

1. React Component Architecture:
• Master React 19 functional components, Hooks (useState, useEffect, useMemo, useCallback, useRef).
• Keep components small, modular, and single-purpose for maximum reusability.

2. State Management Strategies:
• Local UI state: useState and useReducer.
• Server cache state: TanStack Query (React Query) for caching, deduplication, and automatic refetching.
• Global state: Zustand or React Context for authenticated session data.

3. Type-Safe TypeScript:
• Define strict interfaces and types for all API payloads and component props.
• Avoid 'any'; utilize generics (T) and utility types (Partial, Pick, Omit).

4. Action Plan:
Open the Learn tab to explore our interactive frontend modules and build production-grade web applications!`;
  }

  // 4. Full Stack Development
  if (
    query.includes("full stack") ||
    query.includes("fullstack") ||
    query.includes("mern") ||
    query.includes("web dev")
  ) {
    return `Starting a career in Full Stack Development is a great path! Here is your structured mastery blueprint:

1. Frontend Engineering (Phases 1-2):
• Master TypeScript, modern React component architecture, and responsive state management.
• Build real-world interactive UIs connected to backend RESTful APIs.

2. Backend Architecture (Phases 3-4):
• Build production-ready REST APIs using Node.js/Express or Java Spring Boot.
• Implement JWT authentication, role-based access control (RBAC), and transactional database handling.

3. Database & System Design:
• Master PostgreSQL relational schema modeling, foreign keys, indexing, and Redis caching.

4. DevOps & On-Chain Verification:
• Containerize your apps with Docker and deploy to production cloud environments.
• Complete the Full-Stack roadmap milestones in the Learn tab to mint your verified EVM credential!`;
  }

  // 5. Python / Machine Learning / AI
  if (
    query.includes("python") ||
    query.includes("machine learning") ||
    query.includes("ml") ||
    query.includes("deep learning") ||
    query.includes("data science") ||
    query.includes("ai")
  ) {
    return `For modern AI & Machine Learning Engineering:

1. Foundations:
• Master Python, NumPy vectorization, Pandas data wrangling, and linear algebra fundamentals.

2. Applied Machine Learning:
• Scikit-learn algorithms (Random Forests, Gradient Boosting, SVMs), model evaluation, and cross-validation metrics (F1, ROC-AUC).

3. Deep Learning & LLM Systems:
• PyTorch neural networks, HuggingFace transformers, Retrieval-Augmented Generation (RAG) pipelines, and Vector DBs (Pinecone/pgvector).

Switch to the 'AI / ML Engineer' track in the Learn tab to begin your targeted learning milestones!`;
  }

  // 6. Database / SQL / PostgreSQL
  if (
    query.includes("database") ||
    query.includes("sql") ||
    query.includes("postgres") ||
    query.includes("postgresql") ||
    query.includes("mongodb") ||
    query.includes("redis")
  ) {
    return `Database Architecture & Performance Optimization:

1. Relational Schema Modeling (PostgreSQL):
• Normalize schemas to 3NF to avoid data anomalies, then denormalize judiciously for read-heavy operations.
• Establish foreign keys with appropriate ON DELETE constraints (CASCADE vs SET NULL).

2. Indexing Strategies:
• Add B-Tree indexes on frequently queried columns in WHERE clauses, JOIN conditions, and ORDER BY clauses.
• Use Composite Indexes for multi-column filters, ensuring columns match query leading order.

3. Caching with Redis:
• Cache expensive read operations with a Cache-Aside pattern and set appropriate TTLs (Time-To-Live).
• Invalidate cache upon database writes to prevent stale data.`;
  }

  // 7. DSA / Technical Interview Prep
  if (
    query.includes("dsa") ||
    query.includes("interview") ||
    query.includes("algorithm") ||
    query.includes("leetcode") ||
    query.includes("prep") ||
    query.includes("coding")
  ) {
    return `High-Yield Technical Interview Preparation Roadmap:

1. Core DSA Patterns (80/20 Rule):
• Two Pointers & Sliding Window (Arrays, Strings)
• Fast & Slow Pointers (Linked Lists, Cycle Detection)
• Breadth-First & Depth-First Search (Trees, Graphs)
• Binary Search on monotonic solution spaces
• Dynamic Programming (0/1 Knapsack, Memoization)

2. System Design & Scalability:
• Review database indexing, horizontal scaling, caching strategies (Redis), and message queues (Kafka/RabbitMQ).

3. Behavioral (STAR Method):
• Prepare deep-dive explanations of technical challenges you solved, architectural trade-offs made, and bugs debugged in production.`;
  }

  // 8. Projects & Portfolio
  if (
    query.includes("project") ||
    query.includes("portfolio") ||
    query.includes("resume") ||
    query.includes("build")
  ) {
    return `To build an elite tech portfolio that commands recruiter attention, build these 3 production projects:

1. Full-Stack Multi-Tenant SaaS Platform:
• Include authentication, Stripe/Razorpay payments, role-based dashboards, and background task workers.

2. Real-Time Collaboration Workspace:
• Include WebSockets, live user presence detection, Redis pub/sub, and optimistic state updates.

3. Decentralized Verifiable Credential Registry:
• Solidity smart contracts, IPFS decentralized storage, and Web3 wallet signing.

Deploy all 3 with clean GitHub documentation and live demo URLs!`;
  }

  // 9. Blockchain & Verifiable Credentials
  if (
    query.includes("blockchain") ||
    query.includes("verification") ||
    query.includes("evm") ||
    query.includes("smart contract") ||
    query.includes("hash") ||
    query.includes("certificate")
  ) {
    return `SmartEvolve AI verifies credentials through a 4-tier on-chain architecture:

1. Competency Proof:
• Kahn's Directed Acyclic Graph (DAG) algorithm validates curriculum prerequisite mastery before credentials can be unlocked.

2. Cryptographic Fingerprint:
• Your assessment score, student ID, and institution are hashed into a tamper-evident SHA-256 digest.

3. EVM Smart Contract Minting:
• The digest is permanently registered on Polygon/Ethereum Sepolia smart contracts, generating a verifiable transaction hash.

4. Frictionless Global Verification:
• Any recruiter or institution can verify your credential QR code or transaction hash directly on block explorers without intermediaries!`;
  }

  // 10. Intelligent Adaptive Mentor Response
  return `I'm glad you asked! As your SmartEvolve AI Career & Technical Mentor, I'm here to unpack that with you.

Here is how we can explore this together:
• 🚀 Technical & Architectural Deep-Dive: We can explore how modern production systems design and solve for this.
• 💡 Hands-On Implementation: I can guide you through real code examples and practical patterns.
• 🎯 Career & Interview Readiness: We can connect this concept to what top tech companies look for in senior engineering candidates.

Tell me which angle you'd like to explore first, or feel free to ask a specific coding or architectural question!`;
}

export function AiMentorModal({ visible, onClose }: AiMentorModalProps) {
  const [question, setQuestion] = useState("");
  const [chatLog, setChatLog] = useState<
    Array<{ sender: "user" | "mentor"; text: string; providerLabel?: string }>
  >([
    {
      sender: "mentor",
      text: "Hello! 👋 I'm your SmartEvolve AI Career & Technical Mentor. Ask me anything about programming, your roadmap, career goals, or technical interview prep!",
      providerLabel: "✨ SmartEvolve AI Mentor",
    },
  ]);
  const [isAsking, setIsAsking] = useState(false);
  const chatScrollRef = useRef<ScrollView>(null);

  // Background Key Provider State
  const [storedApiKey, setStoredApiKey] = useState("");
  const [storedProv, setStoredProv] = useState<string>("GROQ");

  useEffect(() => {
    AsyncStorage.multiGet([
      "smartevolve_ai_provider",
      "smartevolve_groq_api_key",
      "smartevolve_gemini_api_key",
      "smartevolve_anthropic_api_key",
    ]).then(([provItem, groqItem, gemItem, antItem]) => {
      const groqKey = groqItem?.[1] || "";
      const gemKey = gemItem?.[1] || "";
      const antKey = antItem?.[1] || "";
      const effectiveKey = groqKey || gemKey || antKey || "";
      const effectiveProv = (provItem?.[1] || (groqKey ? "groq" : gemKey ? "gemini" : "groq")).toUpperCase();

      setStoredApiKey(effectiveKey);
      setStoredProv(effectiveProv);
    }).catch(() => {});
  }, [visible]);

  const handleSendQuestion = async (customText?: string) => {
    const textToSend = (customText || question).trim();
    if (!textToSend || isAsking) return;

    setQuestion("");
    setChatLog((prev) => [...prev, { sender: "user", text: textToSend }]);
    setIsAsking(true);

    try {
      // 1. Direct Groq API call if user has a Groq key (LPU ultra-speed)
      if (storedApiKey && storedApiKey.startsWith("gsk_")) {
        const groqModels = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
        for (const gModel of groqModels) {
          try {
            const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${storedApiKey.trim()}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: gModel,
                messages: [
                  {
                    role: "system",
                    content: "You are SmartEvolve AI's intelligent Career & Technical Mentor. Provide direct, inspiring, and technically sound advice with actionable next steps.",
                  },
                  { role: "user", content: textToSend },
                ],
                temperature: 0.7,
                max_tokens: 1024,
              }),
            });
            if (groqRes.ok) {
              const grData = await groqRes.json();
              const grText = grData?.choices?.[0]?.message?.content;
              if (grText && grText.trim().length > 0) {
                setChatLog((prev) => [
                  ...prev,
                  {
                    sender: "mentor",
                    text: grText.trim(),
                    providerLabel: "⚡ Powered by Groq Llama 3.3",
                  },
                ]);
                setIsAsking(false);
                return;
              }
            }
          } catch {
            // Try next model or fall through to backend
          }
        }
      }

      // 2. Direct Gemini API call if user has a Google Gemini key
      if (storedApiKey && (storedApiKey.startsWith("AIzaSy") || storedApiKey.startsWith("AIza"))) {
        const geminiModels = ["gemini-1.5-flash", "gemini-2.0-flash"];
        for (const gModel of geminiModels) {
          try {
            const gemUrl = `https://generativelanguage.googleapis.com/v1beta/models/${gModel}:generateContent?key=${storedApiKey.trim()}`;
            const gemRes = await fetch(gemUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: textToSend }] }],
              }),
            });
            if (gemRes.ok) {
              const gData = await gemRes.json();
              const gText = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (gText && gText.trim().length > 0) {
                setChatLog((prev) => [
                  ...prev,
                  {
                    sender: "mentor",
                    text: gText.trim(),
                    providerLabel: "🔵 Powered by Google Gemini",
                  },
                ]);
                setIsAsking(false);
                return;
              }
            }
          } catch {
            // Try next model or fall through to backend
          }
        }
      }

      // 3. Query backend AI Service (which leverages server-side keys configured on Render)
      const res = await api.askAiMentor(
        textToSend,
        undefined,
        storedApiKey || undefined,
        storedProv
      ).catch(() => null);

      let replyText = "";
      let label = "✨ SmartEvolve AI Mentor";

      if (res && res.reply && res.reply.trim().length > 0) {
        replyText = res.reply.trim();
        label = res.aiProvider === "GROQ"
          ? "⚡ Powered by Groq Llama 3.3"
          : res.aiProvider === "GEMINI"
          ? "🔵 Powered by Google Gemini"
          : res.aiProvider === "ANTHROPIC"
          ? "🟣 Powered by Anthropic Claude"
          : "✨ SmartEvolve AI Mentor";
      } else {
        replyText = getIntelligentMentorResponse(textToSend);
      }

      setChatLog((prev) => [
        ...prev,
        {
          sender: "mentor",
          text: replyText,
          providerLabel: label,
        },
      ]);
    } catch {
      const fallbackText = getIntelligentMentorResponse(textToSend);
      setChatLog((prev) => [
        ...prev,
        {
          sender: "mentor",
          text: fallbackText,
          providerLabel: "✨ SmartEvolve AI Mentor",
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>SmartEvolve AI Mentor</Text>
              <Text style={styles.headerSubTitle}>24/7 Cognitive Career & Technical Advisor</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Chat Messages */}
          <ScrollView
            ref={chatScrollRef}
            style={styles.chatScroll}
            contentContainerStyle={styles.chatContent}
            onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
          >
            {chatLog.map((msg, i) => (
              <View
                key={i}
                style={[
                  styles.msgBubble,
                  msg.sender === "user" ? styles.userBubble : styles.mentorBubble,
                ]}
              >
                {msg.sender === "mentor" && (
                  <Text
                    style={[
                      styles.mentorBadge,
                      msg.providerLabel?.includes("Groq") && { color: "#F59E0B" },
                      msg.providerLabel?.includes("Gemini") && { color: "#60A5FA" },
                      msg.providerLabel?.includes("Anthropic") && { color: "#C084FC" },
                    ]}
                  >
                    {msg.providerLabel || "✨ SmartEvolve AI Mentor"}
                  </Text>
                )}
                <Text style={styles.msgText}>{msg.text}</Text>
              </View>
            ))}
            {isAsking && (
              <View style={[styles.msgBubble, styles.mentorBubble, styles.loadingBubble]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.msgText, { color: colors.textSecondary }]}>
                  AI Mentor is thinking...
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Input Bar */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Ask AI Mentor anything (e.g. How to master Spring Boot?)..."
              placeholderTextColor={colors.textMuted}
              value={question}
              onChangeText={setQuestion}
              onSubmitEditing={() => handleSendQuestion()}
              returnKeyType="send"
              editable={!isAsking}
            />
            <Button
              title="Send ➔"
              size="sm"
              onPress={() => handleSendQuestion()}
              loading={isAsking}
              disabled={!question.trim()}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.82)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  modalCard: {
    width: "100%",
    maxWidth: 680,
    height: "90%",
    maxHeight: 740,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.surfaceLight,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  headerSubTitle: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  chatScroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chatContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  msgBubble: {
    padding: spacing.md,
    borderRadius: radius.md,
    maxWidth: "88%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
  },
  mentorBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
  },
  loadingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },
  mentorBadge: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  msgText: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
});
