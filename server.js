import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: true }));

const SYSTEM_PROMPT = `
You are FusionEdge Assistant, a professional support chatbot for FusionEdge.

Guidelines:
- Be helpful, professional, and concise
- Only discuss FusionEdge, facility management, and workplace operations
- Do NOT provide sensitive, financial, medical, or legal advice
- Do NOT make commitments or promises on behalf of the company
- If unsure, suggest contacting FusionEdge human support
`;

app.post("/api/chat", async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Build messages array with history if provided
    const messages = [{ role: "system", content: SYSTEM_PROMPT }];
    
    if (conversationHistory && Array.isArray(conversationHistory)) {
      // Add last 10 messages for context (limit to prevent token overflow)
      const recentHistory = conversationHistory.slice(-10);
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.text
        });
      });
    }
    
    // Add current message
    messages.push({ role: "user", content: message });

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          temperature: 0.4,
          max_tokens: 400,
          messages: messages,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Groq API Error:", errorData);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      throw new Error("No response from AI");
    }

    res.json({ reply });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ 
      error: "AI service unavailable. Please try again.",
      details: err.message 
    });
  }
});

app.get("/health", (_, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.get("/", (_, res) => {
  res.json({ 
    message: "FusionEdge Chat Backend", 
    status: "running",
    endpoints: {
      chat: "POST /api/chat",
      health: "GET /health"
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 FusionEdge Chat Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});