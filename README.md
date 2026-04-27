### ReconAI Pro — AI-Based Bug Bounty Assistant

# Overview

ReconAI Pro is a full-stack web application that leverages AI to assist in bug bounty reconnaissance and vulnerability analysis. By integrating the Google Gemini API, the system generates structured security insights based on a given target such as a domain or website.

This tool is designed to help users understand how to approach reconnaissance by providing intelligent suggestions, potential vulnerabilities, and guided testing strategies.

# Objective

The objective of this project is to develop an AI-powered assistant that can:

Provide initial reconnaissance insights
Suggest potential vulnerabilities
Guide users in bug bounty methodology
using advanced language models and structured prompt engineering.

# How It Works
User enters a target (e.g., domain name)
Frontend sends request to Node.js backend
Backend generates a structured cybersecurity prompt
Prompt is sent to Gemini API
AI processes and returns recon insights
Results are displayed in a clean UI

# Key Features
🤖 AI-powered reconnaissance assistant
🌐 Full-stack web application (Frontend + Backend)
🧩 Structured prompt engineering for security analysis
⚡ Real-time response using Gemini API
📊 Generates readable recon reports and insights
🎨 Clean and responsive user interface

# Tech Stack
Frontend: HTML, CSS, JavaScript
Backend: Node.js, Express.js
AI Integration: Google Gemini API
Architecture: REST API-based communication

# ⚠️ Disclaimer

This project is an AI-based assistant for learning and guidance purposes only.
It does not perform real vulnerability scanning or penetration testing.

# Future Improvements
📁 Save reports using database (MongoDB/MySQL)
🔐 User authentication system
📄 Export reports (PDF/JSON)
📊 Dashboard for tracking analysis history
🔗 Integration with real reconnaissance tools

# License

This project is for educational purposes.


# Install dependencies
```
npm install
```

# Create .env file
```
copy .env.example .env
```
Open `.env` in Notepad and paste your Gemini API key.
Get a FREE key at: https://aistudio.google.com/apikey

# Start server
```
node server.js
```
Then open: http://localhost:3001

---

# .env file should look like this:
```
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PORT=3001
```

## Model used: gemini-2.0-flash (fast + free tier available)

