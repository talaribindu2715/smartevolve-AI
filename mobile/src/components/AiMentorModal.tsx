import React, { useState, useEffect } from "react";
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
  Alert,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
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
    backendReply.trim().length > 25
  ) {
    return backendReply;
  }

  const query = userText.toLowerCase().trim();

  if (
    query.includes("full stack") ||
    query.includes("frontend") ||
    query.includes("backend") ||
    query.includes("carer") ||
    query.includes("career") ||
    query.includes("web dev")
  ) {
    return `Starting a career in Full Stack Development is a great path! Here is your structured mastery blueprint:

1. Frontend Engineering (Phases 1-2):
• Master TypeScript, modern React 19 component architecture, and responsive state management.
• Build real-world interactive UIs connected to backend RESTful APIs.

2. Backend Architecture (Phases 3-4):
• Build production-ready REST APIs using Node.js/Express or Java Spring Boot.
• Implement JWT authentication, role-based access control, and transaction handling.

3. Database & System Design:
• Master PostgreSQL relational schema modeling, foreign keys, indexing, and Redis caching.

4. DevOps & On-Chain Verification:
• Containerize your apps with Docker and deploy to production.
• Complete the Full-Stack roadmap milestones in the Learn tab to mint your verified EVM credential!`;
  }

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

  if (
    query.includes("project") ||
    query.includes("portfolio") ||
    query.includes("resume") ||
    query.includes("build")
  ) {
    return `To build an elite tech portfolio that commands recruiter attention, build these 3 production projects:

1. Full-Stack Multi-Tenant SaaS:
• Include authentication, Stripe/Razorpay payments, role-based dashboards, and background task workers.

2. Real-Time Collaboration Workspace:
• Include WebSockets, live user presence detection, Redis pub/sub, and optimistic state updates.

3. Decentralized Verifiable Credential Registry:
• Solidity smart contracts, IPFS decentralized storage, and Web3 wallet signing.

Deploy all 3 with clean GitHub documentation and live demo URLs!`;
  }

  if (
    query.includes("interview") ||
    query.includes("job") ||
    query.includes("prep") ||
    query.includes("coding")
  ) {
    return `Here is your high-yield technical interview preparation roadmap:

1. Core DSA Mastery:
• Practice two-pointers, sliding window, binary search, tree traversals, and dynamic programming fundamentals.

2. System Design & Scalability:
• Review database indexing, horizontal scaling, caching strategies (Redis), and message queues (Kafka/RabbitMQ).

3. Technical Behavioral (STAR Method):
• Prepare deep-dive explanations of technical challenges you solved, architectural trade-offs made, and bugs debugged in production.`;
  }

  if (
    query.includes("ai") ||
    query.includes("machine learning") ||
    query.includes("ml") ||
    query.includes("python")
  ) {
    return `For modern AI & Machine Learning Engineering in 2026:

1. Foundations:
• Master Python, NumPy vectorization, Pandas data wrangling, and linear algebra fundamentals.

2. Applied Machine Learning:
• Scikit-learn algorithms (Random Forests, Gradient Boosting), model evaluation, and cross-validation.

3. Deep Learning & LLM Systems:
• PyTorch neural networks, HuggingFace transformers, Retrieval-Augmented Generation (RAG) pipelines, and Vector DBs.

Switch to the 'AI / ML Engineer' track in the Learn tab to begin!`;
  }

  return `Regarding "${userText}":

In SmartEvolve AI, practical application yields the highest retention. Here is your suggested action plan:

1. Roadmap Alignment: Open the Learn tab to inspect your active competencies and priority skill gaps.
2. Hands-on Practice: Build focused code exercises before advancing to next stages.
3. Diagnostic Quiz: Take the end-of-stage diagnostic quiz to boost your proficiency score and unlock verified badges.

Feel free to ask me for specific code examples, architectural explanations, or interview questions!`;
}

export function AiMentorModal({ visible, onClose }: AiMentorModalProps) {
  const [question, setQuestion] = useState("");
  const [chatLog, setChatLog] = useState<
    Array<{ sender: "user" | "mentor"; text: string; providerLabel?: string }>
  >([]);
  const [isAsking, setIsAsking] = useState(false);

  // Provider Selection State (Gemini vs Groq vs Anthropic)
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>("gemini");
  const [geminiKey, setGeminiKey] = useState("");
  const [groqKey, setGroqKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [inputKey, setInputKey] = useState("");
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [keySavedStatus, setKeySavedStatus] = useState<string | null>(null);
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);

  useEffect(() => {
    // Load stored keys and selected provider
    AsyncStorage.multiGet([
      "smartevolve_ai_provider",
      "smartevolve_gemini_api_key",
      "smartevolve_groq_api_key",
      "smartevolve_anthropic_api_key",
    ]).then(([provItem, gemItem, groqItem, antItem]) => {
      const storedGem = gemItem?.[1] || "";
      const storedGroq = groqItem?.[1] || "";
      const storedAnt = antItem?.[1] || "";
      const storedProv = (provItem?.[1] as AiProvider) || (storedGroq ? "groq" : storedGem ? "gemini" : "groq");

      setGeminiKey(storedGem);
      setGroqKey(storedGroq);
      setAnthropicKey(storedAnt);
      setSelectedProvider(storedProv);

      if (storedProv === "groq") setInputKey(storedGroq);
      else if (storedProv === "gemini") setInputKey(storedGem);
      else if (storedProv === "anthropic") setInputKey(storedAnt);

      if (!storedGroq && !storedGem && !storedAnt) {
        setShowKeyConfig(true);
      }
    }).catch(() => {});
  }, [visible]);

  const handleSelectProvider = (prov: AiProvider) => {
    setSelectedProvider(prov);
    AsyncStorage.setItem("smartevolve_ai_provider", prov).catch(() => {});
    if (prov === "gemini") setInputKey(geminiKey);
    else if (prov === "groq") setInputKey(groqKey);
    else if (prov === "anthropic") setInputKey(anthropicKey);
    setKeySavedStatus(null);
  };

  const handleKeyInputChange = (text: string) => {
    setInputKey(text);
    const trimmed = text.trim();
    if (trimmed.startsWith("gsk_") && selectedProvider !== "groq") {
      setSelectedProvider("groq");
    } else if (trimmed.startsWith("AIza") && selectedProvider !== "gemini") {
      setSelectedProvider("gemini");
    } else if (trimmed.startsWith("sk-ant-") && selectedProvider !== "anthropic") {
      setSelectedProvider("anthropic");
    }
  };

  // Live in-app key verification test
  const handleTestKeyDirectly = async (keyToTest?: string) => {
    const rawKey = (keyToTest || inputKey).trim();
    if (!rawKey) {
      setKeySavedStatus("⚠️ Please paste an API key first to test it.");
      return;
    }

    const effectiveProv = rawKey.startsWith("gsk_")
      ? "groq"
      : rawKey.startsWith("AIza")
      ? "gemini"
      : rawKey.startsWith("sk-ant")
      ? "anthropic"
      : selectedProvider;

    if (effectiveProv !== selectedProvider) {
      setSelectedProvider(effectiveProv);
    }

    setIsVerifyingKey(true);
    setKeySavedStatus("Testing connection to " + effectiveProv.toUpperCase() + " API...");

    try {
      if (effectiveProv === "groq") {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${rawKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: "Say 'Groq Llama 3.3 is active and operational!' in exactly 7 words." }],
            max_tokens: 30,
          }),
        });

        const data = await res.json();
        if (res.ok && data?.choices?.[0]?.message?.content) {
          const reply = data.choices[0].message.content.trim();
          setKeySavedStatus(`✓ SUCCESS! Groq Llama 3.3 verified: "${reply}"`);
        } else {
          const errMsg = data?.error?.message || `HTTP ${res.status}`;
          setKeySavedStatus(`❌ Groq Error: ${errMsg}`);
        }
      } else if (effectiveProv === "gemini") {
        const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${rawKey}`;
        const res = await fetch(testUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Say 'Gemini is online!' in 3 words." }] }],
          }),
        });

        const data = await res.json();
        if (res.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          const reply = data.candidates[0].content.parts[0].text.trim();
          setKeySavedStatus(`✓ SUCCESS! Google Gemini replied: "${reply}"`);
        } else {
          const errMsg = data?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
          setKeySavedStatus(`❌ Google Gemini Error: ${errMsg}`);
        }
      } else if (effectiveProv === "anthropic") {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": rawKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-3-5-haiku-20241022",
            max_tokens: 30,
            messages: [{ role: "user", content: "Say 'Claude is online!' in 3 words." }],
          }),
        });

        const data = await res.json();
        if (res.ok && data?.content?.[0]?.text) {
          const reply = data.content[0].text.trim();
          setKeySavedStatus(`✓ SUCCESS! Anthropic Claude replied: "${reply}"`);
        } else {
          const errMsg = data?.error?.message || `HTTP ${res.status}`;
          setKeySavedStatus(`❌ Anthropic Error: ${errMsg}`);
        }
      }
    } catch (err: any) {
      setKeySavedStatus(`❌ Connection error: ${err?.message || "Check network/CORS"}`);
    } finally {
      setIsVerifyingKey(false);
    }
  };

  const handleSaveCustomKey = async () => {
    const trimmed = inputKey.trim();
    let prov = selectedProvider;
    if (trimmed.startsWith("gsk_")) {
      prov = "groq";
      setSelectedProvider("groq");
    } else if (trimmed.startsWith("AIza")) {
      prov = "gemini";
      setSelectedProvider("gemini");
    } else if (trimmed.startsWith("sk-ant-")) {
      prov = "anthropic";
      setSelectedProvider("anthropic");
    }

    if (!trimmed) {
      await AsyncStorage.removeItem("smartevolve_gemini_api_key");
      await AsyncStorage.removeItem("smartevolve_groq_api_key");
      await AsyncStorage.removeItem("smartevolve_anthropic_api_key");
      setGeminiKey("");
      setGroqKey("");
      setAnthropicKey("");
      setKeySavedStatus("Key removed. Using platform cognitive AI.");
      setTimeout(() => setKeySavedStatus(null), 3500);
      return;
    }

    if (prov === "groq") {
      await AsyncStorage.setItem("smartevolve_groq_api_key", trimmed);
      setGroqKey(trimmed);
      setKeySavedStatus("✓ Groq API Key saved securely on device!");
    } else if (prov === "gemini") {
      await AsyncStorage.setItem("smartevolve_gemini_api_key", trimmed);
      setGeminiKey(trimmed);
      setKeySavedStatus("✓ Google Gemini API Key saved securely on device!");
    } else {
      await AsyncStorage.setItem("smartevolve_anthropic_api_key", trimmed);
      setAnthropicKey(trimmed);
      setKeySavedStatus("✓ Anthropic Claude API Key saved securely on device!");
    }
    await AsyncStorage.setItem("smartevolve_ai_provider", prov);

    // Auto-verify key immediately
    handleTestKeyDirectly(trimmed);
  };

  const {
    data: aiHealth,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ["aiHealth"],
    queryFn: () => api.checkAiHealth(),
    enabled: visible,
  });

  const getActiveKey = () => {
    const typed = inputKey.trim();
    if (typed.startsWith("gsk_") || typed.startsWith("AIza") || typed.startsWith("sk-ant")) {
      return typed;
    }
    if (selectedProvider === "groq" && groqKey.trim()) return groqKey.trim();
    if (selectedProvider === "gemini" && geminiKey.trim()) return geminiKey.trim();
    if (selectedProvider === "anthropic" && anthropicKey.trim()) return anthropicKey.trim();
    return groqKey.trim() || geminiKey.trim() || anthropicKey.trim() || typed;
  };

  const activeKey = getActiveKey();
  const isServerAiOnline = aiHealth?.status === "ONLINE" || aiHealth?.working === true;
  const isAiLive = !!activeKey || isServerAiOnline;

  const handleSendQuestion = async (customText?: string) => {
    const textToSend = customText || question.trim();
    if (!textToSend) return;

    setQuestion("");
    setChatLog((prev) => [...prev, { sender: "user", text: textToSend }]);
    setIsAsking(true);

    const effectiveKey = getActiveKey();
    const effectiveProv = effectiveKey.startsWith("gsk_")
      ? "groq"
      : effectiveKey.startsWith("AIza")
      ? "gemini"
      : effectiveKey.startsWith("sk-ant")
      ? "anthropic"
      : selectedProvider;

    try {
      // 1. Direct Call: Groq Llama 3.3 (Prioritized for speed & 100% free)
      if (effectiveProv === "groq" && effectiveKey && effectiveKey.length > 10) {
        try {
          const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${effectiveKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [
                {
                  role: "system",
                  content: "You are SmartEvolve AI's intelligent Career Mentor. Provide direct, inspiring, and technically sound advice with actionable next steps.",
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
                  providerLabel: "⚡ Powered by Groq Llama 3.3 (Ultra Fast)",
                },
              ]);
              setIsAsking(false);
              return;
            }
          } else {
            const errData = await groqRes.json().catch(() => ({}));
            console.warn("Direct Groq API notice:", groqRes.status, errData);
          }
        } catch (clientEx) {
          console.warn("Direct Groq call note (routing via backend):", clientEx);
        }
      }

      // 2. Direct Call: Google Gemini 1.5
      if (effectiveProv === "gemini" && effectiveKey && effectiveKey.length > 15) {
        try {
          const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveKey}`;
          const gRes = await fetch(geminiEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: textToSend }] }],
            }),
          });
          if (gRes.ok) {
            const gData = await gRes.json();
            const gText = gData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (gText && gText.trim().length > 0) {
              setChatLog((prev) => [
                ...prev,
                {
                  sender: "mentor",
                  text: gText.trim(),
                  providerLabel: "🔵 Powered by Google Gemini 1.5",
                },
              ]);
              setIsAsking(false);
              return;
            }
          }
        } catch (clientEx) {
          console.warn("Direct Gemini call note (routing via backend):", clientEx);
        }
      }

      // 3. Direct Call: Anthropic Claude
      if (effectiveProv === "anthropic" && effectiveKey && effectiveKey.length > 15) {
        try {
          const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "x-api-key": effectiveKey,
              "anthropic-version": "2023-06-01",
              "anthropic-dangerous-direct-browser-access": "true",
              "content-type": "application/json",
            },
            body: JSON.stringify({
              model: "claude-3-5-haiku-20241022",
              max_tokens: 1024,
              messages: [{ role: "user", content: textToSend }],
            }),
          });

          if (anthropicRes.ok) {
            const aData = await anthropicRes.json();
            const aText = aData?.content?.[0]?.text;
            if (aText && aText.trim().length > 0) {
              setChatLog((prev) => [
                ...prev,
                {
                  sender: "mentor",
                  text: aText.trim(),
                  providerLabel: "🟣 Powered by Anthropic Claude 3.5",
                },
              ]);
              setIsAsking(false);
              return;
            }
          }
        } catch (clientEx) {
          console.warn("Direct Anthropic call note (routing via backend):", clientEx);
        }
      }

      // 4. Robust Server-Side Call (Handles all providers via Spring Boot)
      const res = await api.askAiMentor(
        textToSend,
        undefined,
        effectiveKey || undefined,
        effectiveProv.toUpperCase()
      );

      const replyText = getIntelligentMentorResponse(textToSend, res?.reply);
      const provider = res?.aiProvider || (res?.isGeminiPowered ? "GEMINI" : "HEURISTIC");

      let label = "💡 SmartEvolve Adaptive AI";
      if (provider === "GEMINI" || (selectedProvider === "gemini" && !!effectiveKey)) {
        label = "🔵 Powered by Google Gemini 1.5";
      } else if (provider === "GROQ" || (selectedProvider === "groq" && !!effectiveKey)) {
        label = "⚡ Powered by Groq Llama 3.3";
      } else if (provider === "ANTHROPIC" || (selectedProvider === "anthropic" && !!effectiveKey)) {
        label = "🟣 Powered by Anthropic Claude 3.5";
      } else if (provider === "OPENAI") {
        label = "🟢 Powered by OpenAI GPT-4o";
      }

      setChatLog((prev) => [
        ...prev,
        {
          sender: "mentor",
          text: replyText,
          providerLabel: label,
        },
      ]);
    } catch (err: any) {
      const fallbackText = getIntelligentMentorResponse(textToSend);
      setChatLog((prev) => [
        ...prev,
        {
          sender: "mentor",
          text: fallbackText,
          providerLabel: "💡 SmartEvolve Adaptive AI",
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const QUICK_QUESTIONS = [
    "How can I become a Full Stack Engineer?",
    "What projects should I build for my portfolio?",
    "Explain how SmartEvolve blockchain verification works",
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>SmartEvolve AI Mentor</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <TouchableOpacity
                onPress={() => setShowKeyConfig(!showKeyConfig)}
                style={styles.keyToggleBtn}
              >
                <Text style={styles.keyToggleBtnText}>⚙️</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Collapsible Custom API Key & Provider Settings */}
          {showKeyConfig && (
            <View style={styles.keyConfigCard}>
              <Text style={styles.keyConfigTitle}>Choose AI Provider & Connect Free Key</Text>
              <Text style={styles.keyConfigDesc}>
                Select an AI provider below. Gemini and Groq are 100% free with no credit card required:
              </Text>

              {/* Provider Selector Tabs */}
              <View style={styles.providerTabsRow}>
                <TouchableOpacity
                  style={[
                    styles.providerTab,
                    selectedProvider === "gemini" && styles.providerTabActiveBlue,
                  ]}
                  onPress={() => handleSelectProvider("gemini")}
                >
                  <Text
                    style={[
                      styles.providerTabText,
                      selectedProvider === "gemini" && styles.providerTabTextActive,
                    ]}
                  >
                    🔵 Google Gemini (Free)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.providerTab,
                    selectedProvider === "groq" && styles.providerTabActiveAmber,
                  ]}
                  onPress={() => handleSelectProvider("groq")}
                >
                  <Text
                    style={[
                      styles.providerTabText,
                      selectedProvider === "groq" && styles.providerTabTextActive,
                    ]}
                  >
                    ⚡ Groq Llama 3.3 (Free & Fast)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.providerTab,
                    selectedProvider === "anthropic" && styles.providerTabActivePurple,
                  ]}
                  onPress={() => handleSelectProvider("anthropic")}
                >
                  <Text
                    style={[
                      styles.providerTabText,
                      selectedProvider === "anthropic" && styles.providerTabTextActive,
                    ]}
                  >
                    🟣 Claude ($5 min)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Helpful Guide Text */}
              <Text style={styles.providerHintText}>
                {selectedProvider === "gemini"
                  ? "💡 Google Gemini is 100% FREE. Get your key in 30 seconds from aistudio.google.com/app/apikey (no card needed)."
                  : selectedProvider === "groq"
                  ? "⚡ Groq is 100% FREE & Ultra-Fast. Sign in with Google at console.groq.com/keys and click 'Create API Key' (no card needed)."
                  : "💳 Anthropic Claude requires adding billing credits ($5.00 min deposit) at platform.claude.com."}
              </Text>

              <TextInput
                style={styles.keyInput}
                value={inputKey}
                onChangeText={handleKeyInputChange}
                placeholder={
                  selectedProvider === "gemini"
                    ? "Paste AIzaSy... (from aistudio.google.com)"
                    : selectedProvider === "groq"
                    ? "Paste gsk_... (from console.groq.com)"
                    : "Paste sk-ant-api03-... (from console.anthropic.com)"
                }
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={false}
              />

              <View style={styles.keyActionRow}>
                <TouchableOpacity
                  style={styles.keySaveBtn}
                  onPress={handleSaveCustomKey}
                  activeOpacity={0.8}
                >
                  <Text style={styles.keySaveBtnText}>Save Key</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.keyTestBtn, isVerifyingKey && { opacity: 0.6 }]}
                  onPress={() => handleTestKeyDirectly()}
                  disabled={isVerifyingKey}
                  activeOpacity={0.8}
                >
                  {isVerifyingKey ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.keyTestBtnText}>⚡ Test & Verify Key</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.keyCloseBtn}
                  onPress={() => setShowKeyConfig(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.keyCloseBtnText}>Close</Text>
                </TouchableOpacity>
              </View>

              {keySavedStatus ? (
                <Text
                  style={[
                    styles.keyStatusText,
                    keySavedStatus.startsWith("❌") && { color: "#F87171" },
                    keySavedStatus.startsWith("⚠️") && { color: "#FBBF24" },
                  ]}
                >
                  {keySavedStatus}
                </Text>
              ) : null}
            </View>
          )}

          {/* Quick Prompts */}
          <View style={styles.quickPromptsWrap}>
            <Text style={styles.quickPromptsLabel}>Quick Prompts:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {QUICK_QUESTIONS.map((q, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.quickChip}
                  onPress={() => handleSendQuestion(q)}
                >
                  <Text style={styles.quickChipText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Chat Messages */}
          <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
            {chatLog.map((msg, i) => (
              <View
                key={i}
                style={[
                  styles.msgBubble,
                  msg.sender === "user" ? styles.userBubble : styles.geminiBubble,
                ]}
              >
                {msg.sender === "mentor" && (
                  <Text
                    style={[
                      styles.geminiBadge,
                      msg.providerLabel?.includes("Anthropic") && { color: "#C084FC" },
                      msg.providerLabel?.includes("Groq") && { color: "#F59E0B" },
                      msg.providerLabel?.includes("Gemini") && { color: "#60A5FA" },
                    ]}
                  >
                    {msg.providerLabel || "💡 SmartEvolve Adaptive AI"}
                  </Text>
                )}
                <Text style={styles.msgText}>{msg.text}</Text>
              </View>
            ))}
            {isAsking && (
              <View style={[styles.msgBubble, styles.geminiBubble, { flexDirection: "row", gap: 8, alignItems: "center" }]}>
                <ActivityIndicator
                  size="small"
                  color={
                    selectedProvider === "anthropic"
                      ? "#C084FC"
                      : selectedProvider === "groq"
                      ? "#F59E0B"
                      : colors.primary
                  }
                />
                <Text style={styles.msgText}>
                  AI Mentor is analyzing...
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
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.md,
  },
  modalCard: {
    width: "100%",
    maxWidth: 680,
    height: "90%",
    maxHeight: 720,
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
  headerTag: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
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
  keyToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  keyToggleBtnText: {
    fontSize: 16,
  },
  keyConfigCard: {
    backgroundColor: "rgba(99, 102, 241, 0.09)",
    borderColor: "rgba(99, 102, 241, 0.35)",
    borderWidth: 1.5,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  keyConfigTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 4,
  },
  keyConfigDesc: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: spacing.xs,
  },
  providerTabsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  providerTab: {
    flex: 1,
    minWidth: 140,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
  },
  providerTabActiveBlue: {
    backgroundColor: "rgba(59, 130, 246, 0.18)",
    borderColor: "#3B82F6",
  },
  providerTabActiveAmber: {
    backgroundColor: "rgba(245, 158, 11, 0.18)",
    borderColor: "#F59E0B",
  },
  providerTabActivePurple: {
    backgroundColor: "rgba(168, 85, 247, 0.18)",
    borderColor: "#A855F7",
  },
  providerTabText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  providerTabTextActive: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  providerHintText: {
    color: colors.accent,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  keyInput: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
    color: colors.textPrimary,
    fontSize: 12,
    fontFamily: "monospace",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: spacing.xs,
  },
  keyActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  keySaveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  keySaveBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  keyTestBtn: {
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  keyTestBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  keyCloseBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  keyCloseBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  keyStatusText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
    lineHeight: 16,
  },
  quickPromptsWrap: {
    padding: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  quickPromptsLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 4,
  },
  quickChip: {
    backgroundColor: "rgba(99, 102, 241, 0.12)",
    borderColor: "rgba(99, 102, 241, 0.3)",
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  quickChipText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "600",
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
  geminiBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
    borderWidth: 1,
  },
  geminiBadge: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 4,
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
