<script setup lang="ts">
import { computed } from "vue"
import { useClipboard } from "@vueuse/core"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface Props {
  message: Message
}

const props = defineProps<Props>()

const { copy, copied } = useClipboard()

const isUser = computed(() => props.message.role === "user")
const formattedTime = computed(() =>
  props.message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
)

const copyMessage = () => {
  copy(props.message.content)
}

// Enhanced markdown formatting for Grok's responses
const formattedContent = computed(() => {
  let content = props.message.content

  // Escape HTML first
  content = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

  // Code blocks with syntax highlighting (```language)
  content = content.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (_, lang, code) => {
    return `<div class="code-block"><div class="code-header">${
      lang || "code"
    }</div><pre><code>${code.trim()}</code></pre></div>`
  })

  // Inline code (single backticks)
  content = content.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')

  // Headers (# ## ###)
  content = content.replace(/^### (.*$)/gm, "<h3>$1</h3>")
  content = content.replace(/^## (.*$)/gm, "<h2>$1</h2>")
  content = content.replace(/^# (.*$)/gm, "<h1>$1</h1>")

  // Bold text (**text**)
  content = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

  // Italic text (*text*)
  content = content.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")

  // Blockquotes (> text)
  content = content.replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>")

  // Numbered lists (1. item)
  content = content.replace(/^(\d+)\.\s+(.*$)/gm, '<div class="list-item numbered">$1. $2</div>')

  // Bullet lists (- item or * item)
  content = content.replace(/^[-*]\s+(.*$)/gm, '<div class="list-item bullet">• $1</div>')

  // Convert URLs to clickable links (after other formatting)
  content = content.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')

  // Convert line breaks to proper paragraphs
  content = content.replace(/\n\n/g, "</p><p>")
  content = content.replace(/\n/g, "<br>")

  // Wrap in paragraph tags if not already wrapped
  if (
    !content.includes("<h1>") &&
    !content.includes("<h2>") &&
    !content.includes("<h3>") &&
    !content.includes('<div class="code-block">') &&
    !content.includes("<blockquote>")
  ) {
    content = `<p>${content}</p>`
  }

  return content
})
</script>

<template>
  <div class="message-wrapper" :class="{ 'user-message': isUser, 'assistant-message': !isUser }">
    <div class="message">
      <div class="message-header">
        <div class="avatar">
          {{ isUser ? "👤" : "🤖" }}
        </div>
        <div class="sender">
          {{ isUser ? "You" : "Grok" }}
        </div>
        <div class="timestamp">
          {{ formattedTime }}
        </div>
        <button @click="copyMessage" class="copy-button" :title="copied ? 'Copied!' : 'Copy message'">
          {{ copied ? "✅" : "📋" }}
        </button>
      </div>

      <div class="message-content" v-html="formattedContent"></div>
    </div>
  </div>
</template>

<style scoped>
.message-wrapper {
  margin-bottom: 1.5rem;
  display: flex;
}

.user-message {
  justify-content: flex-end;
}

.assistant-message {
  justify-content: flex-start;
}

.message {
  max-width: 70%;
  min-width: 200px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
}

.user-message .message {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.assistant-message .message {
  background: rgba(255, 255, 255, 0.95);
  color: #333;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.avatar {
  font-size: 1.2rem;
}

.sender {
  font-weight: 600;
}

.timestamp {
  color: inherit;
  opacity: 0.7;
  font-size: 0.8rem;
  margin-left: auto;
}

.copy-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  opacity: 0.7;
  transition: opacity 0.2s;
  padding: 0.25rem;
  border-radius: 4px;
}

.copy-button:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}

.user-message .copy-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.message-content {
  line-height: 1.6;
  word-wrap: break-word;
}

/* Style formatted content */
.message-content :deep(a) {
  color: inherit;
  text-decoration: underline;
}

.user-message .message-content :deep(a) {
  color: #e3f2fd;
}

.message-content :deep(.inline-code) {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: "Monaco", "Menlo", "Consolas", monospace;
  font-size: 0.9em;
}

.user-message .message-content :deep(.inline-code) {
  background: rgba(255, 255, 255, 0.2);
}

/* Code blocks */
.message-content :deep(.code-block) {
  margin: 1rem 0;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.05);
}

.user-message .message-content :deep(.code-block) {
  background: rgba(255, 255, 255, 0.1);
}

.message-content :deep(.code-header) {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.user-message .message-content :deep(.code-header) {
  background: rgba(255, 255, 255, 0.15);
}

.message-content :deep(.code-block pre) {
  margin: 0;
  padding: 1rem 0.75rem;
  background: rgba(0, 0, 0, 0.03);
  overflow-x: auto;
}

.user-message .message-content :deep(.code-block pre) {
  background: rgba(255, 255, 255, 0.05);
}

.message-content :deep(.code-block code) {
  background: none;
  padding: 0;
  border-radius: 0;
  font-family: "Monaco", "Menlo", "Consolas", monospace;
  font-size: 0.9em;
  line-height: 1.4;
}

/* Headers */
.message-content :deep(h1),
.message-content :deep(h2),
.message-content :deep(h3) {
  margin: 1rem 0 0.5rem 0;
  font-weight: 600;
  line-height: 1.3;
}

.message-content :deep(h1) {
  font-size: 1.3em;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 0.25rem;
}

.user-message .message-content :deep(h1) {
  border-bottom-color: rgba(255, 255, 255, 0.3);
}

.message-content :deep(h2) {
  font-size: 1.2em;
}

.message-content :deep(h3) {
  font-size: 1.1em;
}

/* Blockquotes */
.message-content :deep(blockquote) {
  margin: 1rem 0;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.05);
  border-left: 4px solid rgba(0, 0, 0, 0.2);
  border-radius: 0 4px 4px 0;
  font-style: italic;
}

.user-message .message-content :deep(blockquote) {
  background: rgba(255, 255, 255, 0.1);
  border-left-color: rgba(255, 255, 255, 0.4);
}

/* Lists */
.message-content :deep(.list-item) {
  margin: 0.25rem 0;
  padding-left: 0.5rem;
}

.message-content :deep(.list-item.numbered) {
  font-weight: 500;
}

.message-content :deep(.list-item.bullet) {
  position: relative;
}

/* Paragraphs */
.message-content :deep(p) {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.message-content :deep(p:first-child) {
  margin-top: 0;
}

.message-content :deep(p:last-child) {
  margin-bottom: 0;
}

.message-content :deep(strong) {
  font-weight: 600;
}

.message-content :deep(em) {
  font-style: italic;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .message {
    max-width: 85%;
    min-width: 150px;
  }

  .message-header {
    font-size: 0.8rem;
  }

  .avatar {
    font-size: 1rem;
  }
}
</style>
