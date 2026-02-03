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
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

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
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: message },
          ],
        }),
      }
    );

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI service unavailable" });
  }
});

app.get("/health", (_, res) => {
  res.json({ status: "healthy" });
});

app.listen(5000, () => {
  console.log("🚀 FusionEdge Chat Backend running on port 5000");
});
