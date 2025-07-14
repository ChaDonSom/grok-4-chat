import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 3001
const isProduction = process.env.NODE_ENV === "production"

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true
}))
app.use(express.json())

// API routes first (before static files)
// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Grok 4 Chat Proxy Server" })
})

// Proxy endpoint for xAI API
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, apiKey, ...options } = req.body

    if (!apiKey) {
      return res.status(400).json({ error: "API key is required" })
    }

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        model: "grok-4",
        stream: false,
        temperature: 0.7,
        ...options,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      return res.status(response.status).json({
        error: `xAI API Error: ${response.status} ${response.statusText}`,
        details: errorData,
      })
    }

    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error("Proxy error:", error)
    res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
})

// Serve static files in production (after API routes)
if (isProduction) {
  // Serve static files from dist directory
  app.use(express.static(path.join(__dirname, "dist"), {
    maxAge: '1d',
    etag: false
  }))
  
  // Catch all handler: send back Vue app for any non-API routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"))
  })
} else {
  // Development mode - just serve a simple message
  app.get("*", (req, res) => {
    res.json({ 
      message: "Grok 4 Chat Server - Development Mode",
      note: "Use 'npm run full-dev' to start both frontend and backend"
    })
  })
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Grok 4 Chat Proxy Server running on http://localhost:${PORT}`)
  console.log(`📋 Health check: http://localhost:${PORT}/health`)
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`)
})
