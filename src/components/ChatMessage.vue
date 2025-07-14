<script setup lang="ts">
import { computed } from 'vue'
import { useClipboard } from '@vueuse/core'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Props {
  message: Message
}

const props = defineProps<Props>()

const { copy, copied } = useClipboard()

const isUser = computed(() => props.message.role === 'user')
const formattedTime = computed(() => 
  props.message.timestamp.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
)

const copyMessage = () => {
  copy(props.message.content)
}

// Simple markdown-like formatting for links and basic formatting
const formattedContent = computed(() => {
  let content = props.message.content
  
  // Convert URLs to clickable links
  content = content.replace(
    /(https?:\/\/[^\s]+)/g, 
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  )
  
  // Basic formatting
  content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  content = content.replace(/\*(.*?)\*/g, '<em>$1</em>')
  content = content.replace(/`(.*?)`/g, '<code>$1</code>')
  
  return content
})
</script>

<template>
  <div 
    class="message-wrapper"
    :class="{ 'user-message': isUser, 'assistant-message': !isUser }"
  >
    <div class="message">
      <div class="message-header">
        <div class="avatar">
          {{ isUser ? '👤' : '🤖' }}
        </div>
        <div class="sender">
          {{ isUser ? 'You' : 'Grok' }}
        </div>
        <div class="timestamp">
          {{ formattedTime }}
        </div>
        <button 
          @click="copyMessage"
          class="copy-button"
          :title="copied ? 'Copied!' : 'Copy message'"
        >
          {{ copied ? '✅' : '📋' }}
        </button>
      </div>
      
      <div 
        class="message-content"
        v-html="formattedContent"
      ></div>
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

.message-content :deep(code) {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 0.9em;
}

.user-message .message-content :deep(code) {
  background: rgba(255, 255, 255, 0.2);
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
