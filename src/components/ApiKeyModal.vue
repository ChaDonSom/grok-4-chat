<script setup lang="ts">
import { ref, watch } from "vue"

interface Props {
  show: boolean
  apiKey: string
  useProxy?: boolean
}

interface Emits {
  (e: "update:show", value: boolean): void
  (e: "update:api-key", value: string): void
  (e: "update:use-proxy", value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localApiKey = ref(props.apiKey)
const localUseProxy = ref(props.useProxy || false)
const showKey = ref(false)

// Watch for prop changes
watch(
  () => props.apiKey,
  (newKey) => {
    localApiKey.value = newKey
  }
)

watch(
  () => props.useProxy,
  (newUseProxy) => {
    localUseProxy.value = newUseProxy || false
  }
)

const closeModal = () => {
  emit("update:show", false)
}

const saveApiKey = () => {
  emit("update:api-key", localApiKey.value.trim())
  emit("update:use-proxy", localUseProxy.value)
  closeModal()
}

const toggleShowKey = () => {
  showKey.value = !showKey.value
}

// Close modal on ESC key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    closeModal()
  }
}

// Prevent modal close when clicking inside modal content
const stopPropagation = (event: Event) => {
  event.stopPropagation()
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click="closeModal" @keydown="handleKeydown" tabindex="0">
    <div class="modal-content" @click="stopPropagation">
      <div class="modal-header">
        <h2>⚙️ Settings</h2>
        <button @click="closeModal" class="close-button">×</button>
      </div>

      <div class="modal-body">
        <p class="description">
          Enter your xAI API key to start chatting with Grok 4. You can get your API key from the
          <a href="https://console.x.ai/" target="_blank" rel="noopener noreferrer">xAI Console</a>.
        </p>

        <div class="input-group">
          <label for="api-key-input">🔑 xAI API Key:</label>
          <div class="input-with-toggle">
            <input
              id="api-key-input"
              v-model="localApiKey"
              :type="showKey ? 'text' : 'password'"
              placeholder="xai-..."
              class="api-key-input"
              @keydown.enter="saveApiKey"
            />
            <button
              @click="toggleShowKey"
              class="toggle-visibility"
              type="button"
              :title="showKey ? 'Hide API key' : 'Show API key'"
            >
              {{ showKey ? "🙈" : "👁️" }}
            </button>
          </div>
        </div>

        <div class="input-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="localUseProxy" class="checkbox" />
            <span class="checkmark"></span>
            🌐 Use Proxy Server (Recommended for CORS issues)
          </label>
          <p class="setting-description">
            Enable this to route API requests through a local proxy server at localhost:3001. This helps avoid CORS
            errors and makes the app work better on mobile devices.
          </p>
        </div>

        <div class="security-note">
          <p>🔒 <strong>Security Note:</strong></p>
          <ul>
            <li>Your API key is stored locally in your browser</li>
            <li>It's never sent to any server except xAI's API</li>
            <li>For mobile export, the key won't be included in the HTML file</li>
          </ul>
        </div>

        <div class="cors-note">
          <p>🌐 <strong>CORS Information:</strong></p>
          <p>This app works directly with xAI's API from the browser. If you encounter CORS errors:</p>
          <ul>
            <li>Try using a CORS proxy browser extension</li>
            <li>Or consider setting up a simple backend proxy</li>
            <li>The exported HTML files won't work offline due to CORS restrictions</li>
          </ul>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="btn btn-secondary">Cancel</button>
        <button @click="saveApiKey" class="btn btn-primary" :disabled="!localApiKey.trim()">💾 Save Settings</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
  line-height: 1;
  transition: color 0.2s;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.description {
  margin-bottom: 1.5rem;
  color: #666;
  line-height: 1.5;
}

.description a {
  color: #667eea;
  text-decoration: none;
}

.description a:hover {
  text-decoration: underline;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.input-with-toggle {
  display: flex;
  align-items: center;
  position: relative;
}

.api-key-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
  font-family: "Monaco", "Menlo", "Consolas", monospace;
}

.api-key-input:focus {
  outline: none;
  border-color: #667eea;
}

.toggle-visibility {
  position: absolute;
  right: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toggle-visibility:hover {
  opacity: 1;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  gap: 0.5rem;
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.setting-description {
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.security-note,
.cors-note {
  background: #f8f9fa;
  border-left: 4px solid #667eea;
  padding: 1rem;
  border-radius: 0 8px 8px 0;
  margin-bottom: 1rem;
}

.security-note p,
.cors-note p {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.security-note ul,
.cors-note ul {
  margin: 0.5rem 0 0 0;
  padding-left: 1.5rem;
  color: #666;
}

.security-note li,
.cors-note li {
  margin-bottom: 0.25rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0 1.5rem 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .modal-content {
    margin: 1rem;
    max-width: none;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
