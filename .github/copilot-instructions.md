<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Grok 4 Chat Application

This is a Vue 3 application for chatting with xAI's Grok 4 model using modern bleeding-edge Vue features.

## Technical Stack
- Vue 3 with Composition API and `<script setup>` syntax
- TypeScript for type safety
- Vite for fast development and building
- VueUse for modern Vue composables
- Express.js proxy server for CORS handling

## Architecture Guidelines
- Use `<script setup>` composition API syntax exclusively
- Prefer VueUse composables over manual reactive state management
- Use TypeScript interfaces for all data structures
- Implement responsive design with mobile-first approach
- Follow Vue 3 best practices for performance and maintainability

## Key Features
- Real-time chat interface with Grok 4
- Persistent API key storage using localStorage
- CORS proxy server for seamless API access
- Mobile-friendly design and export capabilities
- Modern UI with glassmorphism effects

## Development Notes
- The app supports both direct API calls and proxy mode
- Proxy server runs on port 3001 to handle CORS issues
- Chat history can be exported as standalone HTML files
- All state is managed using Vue 3 reactivity system with VueUse helpers
