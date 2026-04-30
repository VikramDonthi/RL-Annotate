# RL-Annotate: AI-Driven Data Reinforcement Pipeline

## 📌 Project Overview
**RL-Annotate** is a state-of-the-art MERN stack application designed to bridge the gap between unstructured data ingestion and high-precision AI classification. By implementing a sophisticated **Human-in-the-Loop (HITL)** verification system, the platform simulates the **RLHF (Reinforcement Learning from Human Feedback)** workflows essential for fine-tuning Large Language Models. 

Unlike traditional static labelers, RL-Annotate features an **autonomous reinforcement loop**: it detects when a human engineer overrides an AI prediction, analyzes the reasoning gap, and enables the user to "Self-Refine" the AI's core instructions—turning human corrections into a direct performance boost for the entire pipeline.

## 🛠️ Tech Stack & Skills Showcased
*   **Frontend:** React.js (Vite), Modern Vanilla CSS (SaaS aesthetic).
*   **Backend:** Node.js & Express.js.
*   **Database:** MongoDB (Mongoose Schema design for tracking ML metrics).
*   **AI Integration:** Google Gemini API (v2.0 Flash) with robust offline fallback.
*   **Core Concepts:** Data Operations, AI Auto-Labeling, HITL workflows, System Accuracy metrics.

## 🚀 Key Features
*   **AI Agent Auto-Labeling:** Automatically categorizes raw text into specific domains (Bug, Feature, Urgent, Question, Feedback, General).
*   **Reasoning Chain Visualization:** Displays the AI's "thought process" behind each label to assist in quality benchmarking.
*   **Human-Feedback Interface:** A specialized dashboard for engineers to override AI labels, creating a "Ground Truth" dataset for model refinement.
*   **RLHF Auto-Refine System (Self-Correction):** 
    *   **Mistake Analysis:** The system identifies discrepancies between AI predictions and human corrections.
    *   **Prompt Optimization:** A "Meta-Agent" analyzes these mistakes and generates a new, improved System Prompt.
    *   **Human-in-the-Loop Review:** The system presents the suggested prompt for **Human Review** (Accept or Reject) before deployment.
    *   **Instant Hot-Swapping:** Once accepted, the backend instantly updates its internal logic to improve future accuracy.
*   **Real-Time Accuracy Analytics:** Live tracking of Total Processed data, Pending Reviews, and AI Accuracy percentage.

## 📂 System Architecture

```
RL-Annotate/
│
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         
│   │   │   ├── Dashboard.jsx   # Top-level analytics metrics
│   │   │   ├── IngestionForm.jsx # Data entry portal
│   │   │   ├── ReviewTable.jsx # HITL verification interface
│   │   │   └── PromptTuner.jsx # RLHF Auto-Refine System
│   │   └── index.css           # Premium Professional Design System
│
├── server/                     # Express Backend
│   ├── controllers/
│   │   └── annotationController.js # AI Logic & Prompt Engineering
│   ├── models/
│   │   └── Annotation.js       # MongoDB Schema for quality tracking
│   ├── routes/
│   │   └── annotationRoutes.js # RESTful API Endpoints
│   └── server.js               # Application Entry Point
```

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js installed
- MongoDB Atlas URL
- Gemini API Key

### 1. Clone & Install
```bash
git clone https://github.com/VikramDonthi/RL-Annotate.git
cd RL-Annotate
```

### 2. Server Setup
```bash
cd server
npm install
# Configure your .env with MONGODB_URI and GEMINI_API_KEY
npm start
```

### 3. Client Setup
```bash
cd client
npm install
npm run dev
```

*   **Structured Thinking:** Designing schemas for quality benchmarking and accuracy tracking.
*   **Engineering Fundamentals:** Building a robust, full-stack MERN application with sophisticated API error handling (429/404) and offline fallback modes.
*   **Operational Discipline:** Implementing the full RLHF lifecycle—from data ingestion to human verification and model reinforcement.

## 🚀 Deployment
- **Frontend:** Vercel / Netlify
- **Backend:** Render / Railway
- **Database:** MongoDB Atlas
