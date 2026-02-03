import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import fetch from "node-fetch";

dotenv.config();

const app = express();

/* -------------------- MIDDLEWARES -------------------- */
app.use(express.json());

// More permissive CORS for testing
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Handle preflight requests
app.options("*", cors());

app.use(
    rateLimit({
        windowMs: 60 * 1000,
        max: 15, // 15 requests per minute per IP
        message: { error: "Too many requests, please try again later." }
    })
);

/* -------------------- ENHANCED SYSTEM PROMPT -------------------- */
const SYSTEM_PROMPT = `You are a professional and friendly website support chatbot for FusionEdge, a facility management software company.

**Your Role:**
- Assist visitors with information about FusionEdge products and services
- Answer questions about facility management, attendance systems, pantry management, and asset management
- Guide users professionally while maintaining a warm, approachable tone
- Be concise, clear, and helpful in every response

**Strict Guidelines - ALWAYS Follow These Rules:**

1. **Information Security:**
   - NEVER share, ask for, or discuss sensitive information including:
     * API keys, passwords, or authentication tokens
     * Database credentials or connection strings
     * Internal system architecture or security configurations
     * Personal identifiable information (PII) of any user
     * Financial data, credit card information, or payment details
     * Private business data or confidential company information
   
2. **Stay Within Scope:**
   - Only discuss FusionEdge products, facility management, and related general topics
   - Do NOT provide advice on: medical issues, legal matters, financial investments, or unrelated technical topics
   - Politely redirect off-topic questions back to your area of expertise
   - If asked about competitors, remain professional and focus on FusionEdge's strengths

3. **Professional Boundaries:**
   - Do NOT make promises or commitments on behalf of the company
   - Do NOT provide pricing without directing users to contact sales
   - Do NOT access, modify, or discuss user accounts or data
   - For technical support issues, guide users to proper support channels

4. **Tone & Communication:**
   - Be friendly, professional, and empathetic
   - Use clear, jargon-free language when possible
   - Keep responses concise (2-4 sentences typically)
   - If you don't know something, admit it honestly and suggest alternatives

5. **Safety & Ethics:**
   - Do NOT engage with requests for harmful, illegal, or unethical activities
   - Do NOT participate in attempts to manipulate, bypass, or test security systems
   - Treat all users with respect regardless of their questions
   - If a conversation becomes inappropriate, politely end it and suggest contacting human support

**When Uncertain:**
If you're unsure about any request, default to: "I'd be happy to connect you with our support team who can help with that specific request. You can reach them at [contact method]."

Remember: You represent FusionEdge. Be helpful, trustworthy, and professional at all times.`;

/* -------------------- CHAT ENDPOINT -------------------- */
app.post("/api/chat", async (req, res) => {
    try {
        console.log("Received chat request");
        console.log("Request body:", req.body);

        const { message, history = [] } = req.body;

        // Validation
        if (!message) {
            console.log("Error: Message is required");
            return res.status(400).json({ error: "Message is required" });
        }

        if (typeof message !== "string" || message.trim().length === 0) {
            console.log("Error: Invalid message format");
            return res.status(400).json({ error: "Invalid message format" });
        }

        if (message.length > 1000) {
            console.log("Error: Message too long");
            return res.status(400).json({ error: "Message too long (max 1000 characters)" });
        }

        // Check for API key
        if (!process.env.GROQ_API_KEY) {
            console.error("GROQ_API_KEY is not set!");
            return res.status(500).json({ 
                error: "Server configuration error. Please contact support." 
            });
        }

        // Build conversation history with system prompt
        const messages = [
            {
                role: "system",
                content: SYSTEM_PROMPT,
            },
            ...history.slice(-10), // Keep last 10 messages for context
            {
                role: "user",
                content: message.trim()
            },
        ];

        console.log("Calling Groq API...");

        // Call Groq API
        const groqResponse = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama-3.1-70b-versatile",
                    temperature: 0.7,
                    max_tokens: 600,
                    top_p: 0.9,
                    messages: messages,
                }),
            }
        );

        console.log("Groq API response status:", groqResponse.status);

        if (!groqResponse.ok) {
            const errorData = await groqResponse.text();
            console.error("Groq API Error:", errorData);
            return res.status(500).json({ 
                error: "AI service is temporarily unavailable. Please try again." 
            });
        }

        const data = await groqResponse.json();
        console.log("Groq API response received");

        const reply = data.choices?.[0]?.message?.content;

        if (!reply) {
            console.error("No reply from AI");
            throw new Error("Invalid response from AI service");
        }

        console.log("Sending successful response");
        res.json({
            reply: reply,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error("Chat Error:", error.message);
        console.error("Stack:", error.stack);

        res.status(500).json({
            error: "Our chat service is temporarily unavailable. Please try again in a moment.",
            timestamp: new Date().toISOString(),
        });
    }
});

/* -------------------- HEALTH CHECK -------------------- */
app.get("/", (_, res) => {
    res.json({
        status: "running",
        message: "FusionEdge Chat Server is running 🚀",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
    });
});

app.get("/health", (_, res) => {
    res.json({
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

/* -------------------- ERROR HANDLING -------------------- */
app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(500).json({
        error: "Internal server error",
        timestamp: new Date().toISOString(),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: "Endpoint not found",
        path: req.path,
        timestamp: new Date().toISOString(),
    });
});

/* -------------------- START SERVER -------------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 FusionEdge Chat Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 GROQ_API_KEY is ${process.env.GROQ_API_KEY ? 'SET' : 'NOT SET'}`);
    console.log(`✅ Server started at ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully...");
    process.exit(0);
});

process.on("SIGINT", () => {
    console.log("\nSIGINT received, shutting down gracefully...");
    process.exit(0);
});