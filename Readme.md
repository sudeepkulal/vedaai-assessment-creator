# VedaAI Assessment Creator 🚀

VedaAI Assessment Creator is a state-of-the-art, production-grade academic assessment creator designed for educational institutions. Powered by Google Gemini AI, it enables teachers to custom-craft highly rigorous, curriculum-aligned student evaluation sheets in seconds, complete with diverse question types, visual difficulty badges, grading rubrics, student/teacher dual views, and pixel-perfect multi-page A4 PDF exporting.

---

## 📖 Table of Contents
1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [System Architecture](#-system-architecture)
4. [Folder Structure](#-folder-structure)
5. [Environment Variables](#-environment-variables)
6. [Setup & Installation](#-setup--installation)
7. [High-Fidelity PDF Export](#-high-fidelity-pdf-export)
8. [Deployment Steps](#-deployment-steps)

---

## 🌟 Project Overview
VedaAI streamlines the examination and homework generation pipeline. Teachers specify an evaluation title, target grade, focus topic, overall difficulty, and dynamic question counts (Multiple Choice, Short Answer, True/False) with specific marks parameters. The application:
- Safely processes requests in background job queues backed by Redis.
- Emits real-time generation progress updates over WebSockets.
- Dispatches prompts to the Google Gemini AI API to yield structured, verified JSON questions.
- Renders an A4 examination sheet with Student Credentials blank lines, grouped sections, difficulty badges, correct keys, and suggested grading rubrics.
- Toggles between **Teacher Mode** (keys visible) and **Student Mode** (blanks visible for exam distribution).
- Generates high-resolution multi-page PDF documents locally inside the browser.

---

## 💻 Tech Stack

### **Frontend Container**
- **Core Framework**: Next.js (v16 App Router)
- **State Management**: Redux Toolkit (Slices for Assignments, Websockets, and Creation forms)
- **Form Architecture**: React Hook Form with Zod schema validation
- **Styling Engine**: Tailwind CSS (v4) & PostCSS
- **Real-Time Websockets**: Socket.io-client
- **PDF Compilation**: `html2canvas` (crystal-clear rasterizer) & `jspdf` (A4 sheet PDF engine)
- **Icon Assets**: Lucide React

### **Backend Container**
- **Runtime Environment**: Node.js & TypeScript
- **Web Framework**: Express
- **Database Indexer**: MongoDB via Mongoose
- **Task Queue & Broker**: BullMQ & IORedis
- **Real-Time Sockets**: Socket.io
- **AI Synthesis**: Google Generative AI (`gemini-1.5-flash` model for fast, structured JSON generation)

---

## 🏗️ System Architecture

VedaAI relies on an event-driven, decoupled background worker architecture to handle AI generation asynchronously, ensuring a highly responsive and failure-tolerant experience.

```mermaid
graph TD
    Client[Next.js Frontend] <-->|Socket.io Sockets| Server[Express Server]
    Client -->|REST HTTP POST| Server
    Server -->|Read/Write| MongoDB[(MongoDB Database)]
    Server -->|Add Generation Job| BullMQ[BullMQ Job Producer]
    BullMQ -->|Queue Broker| Redis[(Redis Job Store)]
    Worker[Background AI Worker] -->|Consume Job| BullMQ
    Worker -->|Structured Prompt| Gemini[Gemini API]
    Gemini -->|Valid JSON Schema| Worker
    Worker -->|Save Results| MongoDB
    Worker -->|Notify Completed| Server
    Server <-->|Emit Room Progress Events| Client
```

### **Asynchronous Queue Flow**:
1. **POST Request**: The user submits the Zod-validated creation form. The server creates an assignment in MongoDB with a `generating` status and pushes a generation job onto **BullMQ**.
2. **WebSockets Join**: The client joins a Socket.io room matching the new assignment ID.
3. **AI Worker Ingestion**: The background **BullMQ worker** picks up the job, builds structured instructions, and dispatches them to **Gemini**.
4. **Progress Streaming**: As the worker executes, it emits Socket.io progress events (`generation-started`, `generation-progress`, `generation-completed`) dynamically updated in the Redux store.
5. **Real-time Transition**: When the worker saves the questions to MongoDB and fires completion, the frontend switches the card loader state seamlessly to the complete exam sheet.

---

## 📁 Folder Structure

```
vedaai-assessment-creator/
├── frontend/                     # Next.js App Router (TypeScript)
│   ├── public/                   # Static assets, emblems, empty illustrations
│   ├── src/
│   │   ├── app/                  # Route layouts, pages, and context providers
│   │   │   ├── assignments/      # Dashboard and dynamic assessment paths
│   │   │   │   ├── [id]/         # Printable evaluation sheet & PDF compiler
│   │   │   │   └── create/       # React Hook Form / Zod creation setup
│   │   │   ├── globals.css       # Core design styles & print media directives
│   │   │   ├── layout.tsx        # Shell wrapping providers & shared sidebars
│   │   │   └── providers.tsx     # Unified Redux & Socket.io contexts
│   │   ├── components/           # Desktop Sidebar, Header, Mobile capsule nav
│   │   ├── redux/                # RTK Store configs and slices
│   │   ├── hooks/                # Redux dispatch typed hooks
│   │   └── types/                # Question, Assignment TypeScript schemas
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/                      # Node.js Express API (TypeScript)
│   ├── src/
│   │   ├── config/               # Database, Redis broker, Socket initializers
│   │   ├── controllers/          # Route controller request handlers
│   │   ├── models/               # Mongoose database Schemas (Assignment, Question)
│   │   ├── routes/               # Express API endpoints mapping
│   │   ├── services/             # Gemini prompt builders and regex JSON parsers
│   │   ├── workers/              # BullMQ queue job consumer workers
│   │   └── index.ts              # Express Server entry-point
│   ├── package.json
│   └── tsconfig.json
```

---

## 🔑 Environment Variables

To configure VedaAI, set up `.env` files inside both directories:

### **Backend (`/backend/.env`)**
Create `/backend/.env` with:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/vedaai
REDIS_HOST=localhost
REDIS_PORT=6379
GEMINI_API_KEY=your_google_gemini_api_key
```
> **Note**: If `GEMINI_API_KEY` is not provided or is left as `MOCK_KEY`, the backend automatically falls back to a high-fidelity mock AI assessment compiler so that the generation pipelines function completely offline.

### **Frontend (`/frontend/.env.local`)**
Create `/frontend/.env.local` with:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 🚀 Setup & Installation

Follow these steps to run VedaAI Assessment Creator locally in development mode:

### **Prerequisites**
Ensure you have the following installed:
- Node.js (v18 or higher)
- MongoDB Server
- Redis Server

---

### **1. Clone and Install Dependencies**
```bash
# Clone the repository
git clone https://github.com/sudeepkulal/vedaai-assessment-creator.git
cd vedaai-assessment-creator

# Install Frontend dependencies
cd frontend
npm install

# Install Backend dependencies
cd ../backend
npm install
```

### **2. Start Database and Caches**
Ensure MongoDB and Redis are actively running:
```bash
# Verify MongoDB is running (Default port 27017)
mongod

# Verify Redis is running (Default port 6379)
redis-server
```

### **3. Launch Servers**

#### **Backend Server**
Inside the `/backend` directory:
```bash
npm run dev
```
The server will output: `[VedaAI] Server is actively running on port 5000` and `Assignment BullMQ Worker initialized`.

#### **Frontend Server**
Inside the `/frontend` directory:
```bash
npm run dev
```
The Next.js portal is accessible at: `http://localhost:3000`.

---

## 📄 High-Fidelity PDF Export
VedaAI implements a professional local PDF compilation engine. Instead of triggering raw, unstyled browser prints, clicking **Download PDF**:
1. Dynamically imports `html2canvas` and `jsPDF` at runtime to ensure zero hydration issues.
2. Strips browser-only stylings (rounded card corners, drop shadows, grey border lines) temporarily for a pristine document canvas.
3. Renders the DOM sheet to a high-resolution canvas scaled at `scale: 2` (double-resolution) to keep texts vector-sharp.
4. Distributes the resulting graphic cleanly across A4 pages utilizing a height-ratio shifting loop.
5. Displays a blurred glassmorphic progress spinner to provide premium interaction feedback.

---

## ☁️ Deployment Steps

VedaAI is fully optimized for cloud deployment. Follow these industry standards:

### **1. Production Builds**
Compile TypeScript and bundle resources before deployment:
```bash
# Inside /frontend
npm run build

# Inside /backend
npm run build
```

### **2. Database & Cache Hosting**
- **MongoDB**: Use **MongoDB Atlas** for managed, highly available database clustering.
- **Redis**: Use **Upstash Redis** or **Redis Labs** to host serverless/managed Redis caches.

### **3. Hosting Portals**
- **Frontend App**: Deploy the `/frontend` package to **Vercel** or **Netlify**. Ensure `NEXT_PUBLIC_API_URL` points to your active server url.
- **Backend API & Queue Workers**:
  - Deploy `/backend` to **Render**, **Railway**, or **Heroku**.
  - **Critical**: Ensure the host allows background process executions so that the **BullMQ Background Worker** can safely process jobs asynchronously without thread starvation.
  - Set up environment variables on the cloud provider portal matching the local production keys.
