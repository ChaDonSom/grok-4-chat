# 🚀 Grok 4 Chat

A modern Vue 3 chat application for interacting with xAI's Grok 4 model. Built with bleeding-edge Vue 3 features including Composition API, `<script setup>`, and TypeScript.

## ✨ Features

- 💬 **Real-time Chat**: Interactive chat interface with Grok 4
- 🔑 **Secure API Key Management**: Local storage with privacy protection
- 🌐 **CORS Solution**: Built-in proxy server to avoid CORS issues
- 📱 **Mobile Friendly**: Responsive design that works on all devices
- 📁 **Export Capability**: Download chat history as HTML files for offline viewing
- ⚡ **Modern Tech Stack**: Vue 3, TypeScript, Vite, VueUse
- 🎨 **Beautiful UI**: Glassmorphism design with smooth animations

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- xAI API key from [console.x.ai](https://console.x.ai)

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the development server**

   ```bash
   # Option 1: Frontend only (may have CORS issues)
   npm run dev

   # Option 2: Frontend + Proxy server (recommended)
   npm run full-dev
   ```

3. **Set your API key**
   - Click the "Settings" button in the app
   - Enter your xAI API key
   - Enable proxy mode if experiencing CORS issues

## 🛠️ Available Scripts

- `npm run dev` - Start frontend development server
- `npm run server` - Start proxy server only
- `npm run server:dev` - Start proxy server with auto-reload
- `npm run full-dev` - Start both frontend and proxy server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🌐 CORS Solutions

### Option 1: Proxy Server (Recommended)

Enable proxy mode in settings to route requests through `localhost:3001`. This solves CORS issues and works great for development and mobile testing.

### Option 2: Direct API Calls

Works in some environments but may encounter CORS restrictions. Best for production deployments with proper CORS configuration.

### Option 3: Mobile Export

Export chat as HTML file to run offline on mobile devices. Note: The exported HTML won't be able to make new API calls due to CORS restrictions.

## 📱 Mobile Usage

1. **Development**: Use proxy mode and access via `http://your-computer-ip:5173`
2. **Export Method**: Export chat as HTML and open in mobile browser
3. **Build & Serve**: Build the app and serve it with proper CORS headers

## 🏗️ Architecture

- **Frontend**: Vue 3 + TypeScript + Vite
- **State Management**: Vue 3 Reactivity + VueUse
- **Styling**: CSS with Glassmorphism effects
- **Proxy Server**: Express.js for CORS handling
- **API Integration**: xAI Grok 4 via REST API

## 🔧 Configuration

### Environment Variables (.env)

```bash
PORT=3001  # Proxy server port
```

### API Key Storage

API keys are stored locally in your browser's localStorage and never sent to any server except xAI's official API.

## 🎨 Tech Stack

- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Vite** for fast development
- **VueUse** for modern composables
- **Express.js** for proxy server
- **Glassmorphism UI** design

## 📄 License

MIT License - feel free to use this project as a starting point for your own xAI integrations!

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.
