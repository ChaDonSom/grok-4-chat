import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const isProduction = process.env.NODE_ENV === "production"

app.use(cors())
app.use(express.json())

// Serve static files in production
if (isProduction) {
  app.use(express.static(path.join(__dirname, "dist")))
}

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

// Serve the Vue app for all other routes in production
if (isProduction) {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"))
  })
}

app.listen(PORT, () => {
  console.log(`🚀 Grok 4 Chat Proxy Server running on http://localhost:${PORT}`)
  console.log(`📋 Health check: http://localhost:${PORT}/health`)
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`)
})
