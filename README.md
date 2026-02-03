# FusionEdge AI Chat Backend

A secure, professional chatbot backend server for FusionEdge facility management software using Groq AI (Llama 3.1).

## 🚀 Features

- **Secure AI Chat**: Professional chatbot with strict security guidelines
- **Rate Limiting**: 15 requests per minute per IP to prevent abuse
- **CORS Protection**: Configurable cross-origin resource sharing
- **Error Handling**: Comprehensive error handling and logging
- **Health Checks**: Built-in health check endpoints
- **Professional Tone**: AI trained to be friendly yet professional
- **Scope Limiting**: AI strictly stays within FusionEdge domain knowledge

## 🔒 Security Features

The AI chatbot is configured with strict security guidelines:

- ✅ Never shares sensitive information (API keys, passwords, credentials)
- ✅ Never discusses internal system architecture
- ✅ Never accesses or modifies user data
- ✅ Stays within scope (facility management domain)
- ✅ Professional boundaries on pricing and commitments
- ✅ Redirects inappropriate or out-of-scope questions

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Groq API Key (get one from [console.groq.com](https://console.groq.com))

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd fusionedge-chat-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Add your Groq API key to `.env`**
   ```
   GROQ_API_KEY=your_actual_groq_api_key_here
   PORT=5000
   NODE_ENV=development
   ```

## 🚀 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### 1. Health Check
```
GET /
```
Returns server status and version info.

### 2. Health Status
```
GET /health
```
Returns detailed health information including uptime.

### 3. Chat Endpoint
```
POST /api/chat
```

**Request Body:**
```json
{
  "message": "What is FusionEdge?",
  "history": [
    { "role": "user", "content": "Hi" },
    { "role": "assistant", "content": "Hello! How can I help you?" }
  ]
}
```

**Response:**
```json
{
  "reply": "FusionEdge is a comprehensive facility management software...",
  "timestamp": "2024-02-02T10:30:00.000Z"
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "timestamp": "2024-02-02T10:30:00.000Z"
}
```

## 🔧 Configuration

### Rate Limiting
Edit in `server.js`:
```javascript
app.use(
  rateLimit({
    windowMs: 60 * 1000, // Time window
    max: 15, // Max requests per window
  })
);
```

### CORS
For production, restrict origins:
```javascript
app.use(
  cors({
    origin: "https://yourfrontend.com", // Replace with your domain
  })
);
```

### AI Model Settings
Adjust in the Groq API call:
```javascript
{
  model: "llama-3.1-70b-versatile",
  temperature: 0.7,    // Creativity (0-1)
  max_tokens: 600,     // Response length
  top_p: 0.9          // Diversity
}
```

## 🧪 Testing

### Test with curl
```bash
# Health check
curl http://localhost:5000/

# Chat request
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What services does FusionEdge offer?"
  }'
```

### Test with Postman
1. Create a POST request to `http://localhost:5000/api/chat`
2. Set header: `Content-Type: application/json`
3. Set body (raw JSON):
```json
{
  "message": "Tell me about FusionEdge"
}
```

## 📦 Deployment

### Deploy to Heroku
```bash
heroku create your-app-name
heroku config:set GROQ_API_KEY=your_key_here
git push heroku main
```

### Deploy to Railway
1. Connect your GitHub repo to Railway
2. Add environment variables in Railway dashboard
3. Deploy automatically on push

### Deploy to Render
1. Connect your GitHub repo
2. Add environment variables
3. Set build command: `npm install`
4. Set start command: `npm start`

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | Your Groq API key | Yes |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | No |

## 📝 AI System Prompt Features

The chatbot is configured with a comprehensive system prompt that ensures:

1. **Professional Identity**: Represents FusionEdge professionally
2. **Friendly Tone**: Warm and approachable communication
3. **Strict Security**: Never shares sensitive information
4. **Scope Limiting**: Stays within facility management domain
5. **Honesty**: Admits when uncertain and redirects appropriately
6. **Ethics**: Refuses harmful or inappropriate requests

## 🐛 Troubleshooting

### Error: "Groq API failed"
- Check if your API key is correct in `.env`
- Verify you have API credits in your Groq account
- Check if the API is accessible (no network issues)

### Error: "Message is required"
- Ensure your request body includes a `message` field
- Check that the message is a non-empty string

### Rate limit errors
- Wait 60 seconds before trying again
- Reduce request frequency
- Consider increasing the rate limit for your use case

## 📄 License

ISC

## 👥 Support

For issues or questions:
- Email: support@fusionedge.com
- Documentation: [docs.fusionedge.com]

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Built with ❤️ for FusionEdge**