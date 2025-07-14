import express from "express"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

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

app.listen(PORT, () => {
  console.log(`🚀 Grok 4 Chat Proxy Server running on http://localhost:${PORT}`)
  console.log(`📋 Health check: http://localhost:${PORT}/health`)
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`)
})
