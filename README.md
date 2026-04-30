# RL-Annotate: AI-Driven Data Reinforcement Pipeline

## 📌 Project Overview
**RL-Annotate** is a high-performance MERN stack application designed to automate the categorization of unstructured text data using AI Agents. The platform implements a **Human-in-the-Loop (HITL)** verification system, allowing human engineers to review and correct AI-generated labels—simulating the core **RLHF (Reinforcement Learning from Human Feedback)** workflows used in modern LLM training.

## 🛠️ Tech Stack & Skills Showcased
*   **Frontend (UI/UX):** React.js (Vite), Modern Vanilla CSS (SaaS aesthetic).
*   **Backend (API & Logic):** Node.js & Express.js.
*   **Database (Source of Truth):** MongoDB (Mongoose Schema design for tracking ML metrics).
*   **AI Integration:** Google Gemini API (Zero-shot text classification).
*   **Core Concepts:** Data Operations, AI Auto-Labeling, HITL workflows, System Accuracy metrics.

## 🚀 Key Features
*   **AI Agent Auto-Labeling:** Automatically categorizes raw text into specific domains (e.g., Bug, Feature, Urgent, Question) using structured prompting.
*   **Reasoning Chain Visualization:** Displays the AI's "thought process" behind each label to assist in quality benchmarking.
*   **Human-Feedback Interface:** A specialized dashboard for engineers to override AI labels, creating a "Ground Truth" dataset for model refinement.
*   **RLHF Auto-Refine System:** A sophisticated feedback loop where the AI analyzes its own mistakes against human ground truth and suggests its own "Self-Correction" instructions to improve future accuracy.
*   **Accuracy Analytics:** Real-time calculation of AI precision vs. Human verification to monitor model performance.

## 📂 System Architecture & Folder Structure

```
RL-Annotate/
│
├── client/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── components/         # UI Components
│   │   │   ├── Dashboard.jsx   # Top-level analytics metrics
│   │   │   ├── IngestionForm.jsx # Text input for AI
│   │   │   ├── ReviewTable.jsx # HITL data verification interface
│   │   │   └── PromptTuner.jsx # RLHF self-correction system
│   │   ├── App.jsx             # Main Application Logic
│   │   └── index.css           # Premium Professional Design System
│   └── package.json
│
├── server/                     # Express Backend API
│   ├── controllers/
│   │   └── annotationController.js # AI Integration & RLHF calculation logic
│   ├── models/
│   │   └── Annotation.js       # MongoDB Schema for tracking accuracy
│   ├── routes/
│   │   └── annotationRoutes.js # RESTful endpoints
│   ├── server.js               # Application Entry Point
│   └── .env                    # Environment variables (MongoDB URI, AI API Key)
```

### Database Schema (The "Source of Truth")
We use a dual-label schema to track AI performance against human logic.
```javascript
{
  text_input: String,
  ai_prediction: { label: String, reasoning: String },
  human_correction: { label: String, verified: Boolean },
  accuracy_score: Number, // 1 if match, 0 if mismatch
  timestamp: Date
}
```

### AI Agent & RLHF Workflow
The system implements a complete Reinforcement Learning cycle:
1.  **Ingestion:** Raw text is uploaded via the React dashboard.
2.  **Auto-Label:** The Node.js agent predicts the category (using Gemini) and saves it to MongoDB.
3.  **Review:** The user sees a comparison table. If the AI is wrong, the user overrides the label.
4.  **Reinforce (Auto-Refine):** Clicking "Auto-Refine" triggers a "Meta-Agent" that looks at the mistakes, analyzes the discrepancy, and rewrites the System Prompt to optimize future model behavior.

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB Cluster URL (Atlas)
- Gemini API Key

### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/VikramDonthi/RL-Annotate.git
    cd RL-Annotate
    ```
2.  **Server Setup:**
    ```bash
    cd server
    npm install
    # Create .env with PORT, MONGODB_URI, and GEMINI_API_KEY
    npm start
    ```
3.  **Client Setup:**
    ```bash
    cd client
    npm install
    npm run dev
    ```

---

## 🎯 Alignment with Ethara.AI
This project demonstrates readiness for the **Software Engineer – AI Data Operations** role by showcasing:
*   **Structured Thinking:** Designing schemas for quality benchmarking.
*   **Engineering Fundamentals:** Building a robust MERN stack application with API integration.
*   **Operational Discipline:** Understanding the metrics-driven nature of RLHF and the importance of closing the human-feedback loop.

## 🚀 Deployment (Recommended)
- **Frontend:** Deploy the `client` folder to **Vercel** or **Netlify**.
- **Backend:** Deploy the `server` folder to **Render** or **Railway**.
- **Database:** Connect to your existing **MongoDB Atlas** cluster.
- **Environment Variables:** Ensure `MONGODB_URI` and `GEMINI_API_KEY` are set in your production host settings.
