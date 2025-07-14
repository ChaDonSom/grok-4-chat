<script setup lang="ts">
import { ref, computed, nextTick } from "vue"
import { useStorage } from "@vueuse/core"
import ChatMessage from "./components/ChatMessage.vue"
import ApiKeyModal from "./components/ApiKeyModal.vue"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// Reactive state
const messages = ref<Message[]>([])
const currentMessage = ref("")
const isLoading = ref(false)
const showApiKeyModal = ref(false)

// Persistent storage for API key and settings
const apiKey = useStorage("grok-api-key", "")
const useProxy = useStorage("grok-use-proxy", false)

// Computed
const hasApiKey = computed(() => apiKey.value.trim() !== "")
const canSend = computed(() => currentMessage.value.trim() !== "" && !isLoading.value && hasApiKey.value)

// Chat container ref for auto-scroll
const chatContainer = ref<HTMLElement>()

// Auto-scroll to bottom
const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// Send message to Grok 4
const sendMessage = async () => {
  if (!canSend.value) return

  const userMessage: Message = {
    id: Date.now().toString(),
    role: "user",
    content: currentMessage.value.trim(),
    timestamp: new Date(),
  }

  messages.value.push(userMessage)
  currentMessage.value = ""
  isLoading.value = true

  try {
    await scrollToBottom()

    let response: Response

    if (useProxy.value) {
      // Use local proxy server to avoid CORS
      const apiUrl = import.meta.env.PROD ? "/api/chat" : "http://localhost:3001/api/chat"
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: apiKey.value,
          messages: [
            {
              role: "system",
              content:
                "You are Grok, a helpful and witty AI assistant. Be conversational, helpful, and occasionally humorous.",
            },
            ...messages.value.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          ],
        }),
      })
    } else {
      // Direct API call (may encounter CORS issues)
      response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey.value}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are Grok, a helpful and witty AI assistant. Be conversational, helpful, and occasionally humorous.",
            },
            ...messages.value.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          ],
          model: "grok-4",
          stream: false,
          temperature: 0.7,
        }),
      })
    }

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText }
      }
      throw new Error(
        `API Error: ${response.status} ${response.statusText} - ${
          errorData.error || errorData.details || "Unknown error"
        }`
      )
    }

    const data = await response.json()
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: data.choices[0].message.content,
      timestamp: new Date(),
    }

    messages.value.push(assistantMessage)
    await scrollToBottom()
  } catch (error) {
    console.error("Error calling Grok API:", error)
    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}${
        !useProxy.value ? "\n\n💡 Try enabling proxy mode in settings if you're experiencing CORS issues." : ""
      }`,
      timestamp: new Date(),
    }
    messages.value.push(errorMessage)
  } finally {
    isLoading.value = false
  }
}

// Handle Enter key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// Clear chat
const clearChat = () => {
  messages.value = []
}

// Export chat as HTML for offline use
const exportChat = () => {
  const chatHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grok 4 Chat Export</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .chat-export { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .message { margin-bottom: 16px; padding: 12px; border-radius: 8px; }
        .user { background: #007AFF; color: white; margin-left: 60px; }
        .assistant { background: #E5E5EA; color: black; margin-right: 60px; }
        .timestamp { font-size: 0.8em; opacity: 0.7; margin-top: 4px; }
        h1 { text-align: center; color: #333; }
    </style>
</head>
<body>
    <div class="chat-export">
        <h1>Grok 4 Chat - ${new Date().toLocaleDateString()}</h1>
        ${messages.value
          .map(
            (msg) => `
            <div class="message ${msg.role}">
                <div>${msg.content}</div>
                <div class="timestamp">${msg.timestamp.toLocaleString()}</div>
            </div>
        `
          )
          .join("")}
    </div>
</body>
</html>`

  const blob = new Blob([chatHtml], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `grok-chat-${new Date().toISOString().split("T")[0]}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Show API key modal on mount if no key exists
if (!hasApiKey.value) {
  showApiKeyModal.value = true
}
</script>

<template>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <h1>🚀 Grok 4 Chat</h1>
      <div class="header-actions">
        <button @click="showApiKeyModal = true" class="btn btn-secondary">
          {{ hasApiKey ? "⚙️ Settings" : "🔑 Set API Key" }}
        </button>
        <button @click="clearChat" class="btn btn-secondary" :disabled="messages.length === 0">🗑️ Clear</button>
        <button @click="exportChat" class="btn btn-secondary" :disabled="messages.length === 0">
          📱 Export for Mobile
        </button>
      </div>
    </header>

    <!-- Chat Container -->
    <div ref="chatContainer" class="chat-container">
      <div class="messages">
        <div v-if="messages.length === 0" class="welcome-message">
          <h2>👋 Welcome to Grok 4 Chat!</h2>
          <p>Start a conversation with Grok, xAI's advanced language model.</p>
          <p v-if="!hasApiKey" class="warning">⚠️ Please set your xAI API key to begin chatting.</p>
        </div>

        <ChatMessage v-for="message in messages" :key="message.id" :message="message" />

        <div v-if="isLoading" class="loading">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>Grok is thinking...</p>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-area">
      <div class="input-container">
        <textarea
          v-model="currentMessage"
          @keydown="handleKeydown"
          placeholder="Ask Grok anything..."
          class="message-input"
          rows="1"
          :disabled="!hasApiKey"
        ></textarea>
        <button @click="sendMessage" :disabled="!canSend" class="send-button">
          {{ isLoading ? "⏳" : "🚀" }}
        </button>
      </div>
      <div class="input-hint" v-if="hasApiKey">Press Enter to send, Shift+Enter for new line</div>
      <div class="input-hint warning" v-else>Set your API key to start chatting</div>
    </div>

    <!-- API Key Modal -->
    <ApiKeyModal v-model:show="showApiKeyModal" v-model:api-key="apiKey" v-model:use-proxy="useProxy" />
  </div>
</template>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background: #e0e0e0;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.messages {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 2rem;
}

.welcome-message {
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
}

.welcome-message h2 {
  margin: 0 0 1rem 0;
  color: #333;
}

.welcome-message p {
  margin: 0.5rem 0;
  color: #666;
}

.welcome-message .warning {
  color: #d63031;
  font-weight: 500;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  margin-bottom: 0.5rem;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}
.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.input-area {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.input-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  resize: vertical;
  min-height: 50px;
  max-height: 150px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.message-input:focus {
  outline: none;
  border-color: #667eea;
}

.message-input:disabled {
  background: #f5f5f5;
  color: #999;
}

.send-button {
  padding: 1rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
  min-width: 60px;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-hint {
  text-align: center;
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.5rem;
}

.input-hint.warning {
  color: #d63031;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }

  .header-actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  .input-area {
    padding: 1rem;
  }

  .chat-container {
    padding: 0.5rem;
  }
}
</style>
