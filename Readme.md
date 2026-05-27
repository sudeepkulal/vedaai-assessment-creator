# VedaAI Assessment Creator 🚀

**🔗 Live Demo / Production Link:** [vedaai-assessment-creator-seven.vercel.app](https://vedaai-assessment-creator-seven.vercel.app/)

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

## 💎 Advanced Key Features & Interactive Capabilities

Here are the core technical achievements built into VedaAI that guarantee an elite, production-grade, and resilient user experience:

1. **Decoupled Background Task Processing (BullMQ & Redis)**:
   - Instead of running slow AI API requests synchronously inside the HTTP request loop (which risks server timeouts and thread blocking), generation requests are converted to background jobs.
   - Leverages **BullMQ** running over an isolated **Redis instance** to orchestrate job retries, concurrency limits (set to `2` concurrent jobs), and resilient failure recovery.

2. **Real-Time Progress Streaming (WebSockets / Socket.io)**:
   - The Next.js frontend joins a dedicated WebSocket channel for the created assignment.
   - The background BullMQ worker emits multi-stage progress events (`40%`, `70%`, `100%`) back to the frontend, updating a beautiful glowing status indicator in the UI.

3. **Structured AI Schema Enforcement (Gemini 2.5 Flash)**:
   - Employs strict JSON formatting directives combined with a robust post-generation validation utility.
   - The backend checks each question for correct structure, matching options, valid type configurations, and automatically generates high-quality evaluation rubrics.

4. **Resilient Local Mock AI Fallback (100% Offline Active)**:
   - Features an automated mock generator fallback. If the backend fails to connect to the Gemini API or the API key is not specified, it seamlessly switches to a fallback generator.
   - This lets developers and interviewers run and test the complete end-to-end WebSocket, BullMQ queue, MongoDB indexer, and PDF download pipeline entirely offline.

5. **Instant Dual-View Layout Controls (Teacher Mode vs. Student Mode)**:
   - Transform the visual canvas on the fly!
   - **Teacher Mode** displays correct answers, options, and recommended academic grading rubrics.
   - **Student Mode** masks all answers, converts short answer zones to write-in lines, and provides a pristine student exam sheet.

6. **Ultra-High-Resolution PDF Compiler (html2canvas & jsPDF)**:
   - Incorporates client-side PDF synthesis with custom layout patches.
   - Runs double-resolution canvas rendering (`scale: 2`) to ensure texts are vector-sharp.
   - Leverages page height ratio shifts to dynamically divide multi-page sheets without clipping questions.
   - Employs a custom styling engine override that automatically bypasses Tailwind v4 OKLCH color parsing issues to compile a flawless printable design.

7. **Native Web-Print Overrides (@media print)**:
   - Backup printable sheets utilizing native browser layout configurations.
   - Uses `@media print` directives with standardized `@page` margins, automatically hides non-essential headers, sidebars, and navigation menus (`no-print`), and forces correct option alignment.

8. **Database-Level Performance Optimizations (MongoDB Text Indexing)**:
   - Features custom database index definitions. The MongoDB schema indexes both `title` and `topic` fields as standard text indexes.
   - This ensures live dashboard query searches complete in O(1) time regardless of dataset scaling.

9. **Fully Touch-Responsive 3-Dot Mobile Action Dropdowns**:
   - Implements beautiful context action dropdowns with options exactly configured to **"View"** and **"Delete"**.
   - Includes a native touch-outside listener detecting tap events (`touchstart`) and clicks, combined with structural element ancestry checking (`.closest()`) to avoid mobile viewport issues.

---

## 🛠️ Code Map: Architectural & Implementation Reference

Walk the interviewer directly through the codebase using this exact file locator guide:

| Architectural Component | Responsibility | Implementation File Location |
| :--- | :--- | :--- |
| **Database Schema** | Defines MongoDB document structures, timestamps, and search indexes | [`backend/src/models/Assignment.ts`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/backend/src/models/Assignment.ts) |
| **API Endpoints** | Maps REST routes for creating, fetching, and deleting assessments | [`backend/src/routes/assignmentRoutes.ts`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/backend/src/routes/assignmentRoutes.ts) |
| **Request Controller** | Receives HTTP calls and initiates asynchronous database saves | [`backend/src/controllers/assignmentController.ts`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/backend/src/controllers/assignmentController.ts) |
| **BullMQ Queue Producer** | Serializes metadata parameters and pushes tasks onto Redis | [`backend/src/queues/assignmentQueue.ts`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/backend/src/queues/assignmentQueue.ts) |
| **Background AI Worker** | Consumes BullMQ tasks, coordinates socket streaming, and saves results | [`backend/src/workers/assignmentWorker.ts`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/backend/src/workers/assignmentWorker.ts) |
| **AI Prompt Builder** | Generates Gemini system directives, validates JSON, and provides Mock fallback | [`backend/src/services/aiService.ts`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/backend/src/services/aiService.ts) |
| **WebSocket Handler** | Initializes Socket.io connection rooms and handles network state | [`backend/src/sockets/socketHandler.ts`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/backend/src/sockets/socketHandler.ts) |
| **Unified Redux Store** | Centralizes React context providers, stores, and Redux Toolkit configuration | [`frontend/src/redux/store.ts`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/frontend/src/redux/store.ts) |
| **Assignments State Slice** | Implements Redux actions for loading, adding, and deleting assessments | [`frontend/src/redux/slices/assignmentSlice.ts`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/frontend/src/redux/slices/assignmentSlice.ts) |
| **WebSocket State Slice** | Manages live numerical generation progress percentages inside React | [`frontend/src/redux/slices/socketSlice.ts`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/frontend/src/redux/slices/socketSlice.ts) |
| **Zod Creation Schema** | Validates title, topics, difficulty levels, and question row margins | [`frontend/src/app/assignments/create/page.tsx`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/frontend/src/app/assignments/create/page.tsx) |
| **Dashboard Interactive Grid** | Integrates Search queries, Status tabs, and Touch-outside dropdowns | [`frontend/src/app/assignments/page.tsx`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/frontend/src/app/assignments/page.tsx) |
| **PDF Compilation Engine** | Drives double-scale canvas renders, page splits, and Tailwind color bypasses | [`frontend/src/app/assignments/[id]/page.tsx`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/frontend/src/app/assignments/%5Bid%5D/page.tsx) (in `handleDownloadPDF`) |
| **Native CSS Print Media** | Defines page layout overrides and hides headers/sidebars during prints | [`frontend/src/app/assignments/[id]/page.tsx`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/frontend/src/app/assignments/%5Bid%5D/page.tsx) (in CSS `@media print` section) |

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
- **AI Synthesis**: Google Generative AI (`gemini-2.5-flash` model for fast, structured JSON generation)

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
### **Architecture Overview**:

The application follows an event-driven, decoupled architecture to avoid blocking API requests during AI generation.

### Flow
1. Teacher submits assignment configuration from the frontend.
2. Express API creates an assignment record in MongoDB.
3. A background job is added to BullMQ (Redis).
4. API instantly returns a `202 Accepted` response.
5. Worker service processes the job and calls Gemini API.
6. Progress updates are streamed via Socket.io.
7. Generated questions are saved in MongoDB.
8. Teacher downloads PDF generated client-side.

## Why this Architecture?
- Non-blocking API design
- Better scalability using background workers
- Real-time progress updates
- Improved user experience
- Reduced backend load with client-side PDF generation

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
Copy `frontend/.env.local.example` to `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```
The frontend uses this URL for REST API calls and Socket.io connections.

---

## 🚀 Setup & Installation

Follow these absolute local setup and launch instructions to run VedaAI Assessment Creator on your system:

### **Prerequisites**
Ensure you have the following installed:
- **Node.js** (v18.0.0 or higher)
- **Docker Desktop** (Active and running to spin up database and cache containers)

---

### **Step 1: Setup Environment Files (.env)**
VedaAI is configured to read environment configurations dynamically. Open a terminal inside your repository root folder and run:

```powershell
# Copy the backend template to active local env
Copy-Item backend/.env.example backend/.env

# Copy the frontend template to active local env
Copy-Item frontend/.env.example frontend/.env.local
```

> **Offline Mode Active**: Your local `backend/.env` is pre-configured with `GEMINI_API_KEY=MOCK_KEY`. This lets you run the entire WebSocket, BullMQ background queue, and PDF download pipeline fully offline on your laptop with highly realistic mock questions without needing an active internet connection or Gemini subscription! If you want to use the real AI, simply replace `MOCK_KEY` with your active Gemini API key.

---

### **Step 2: Spin Up Infrastructure (MongoDB & Redis via Docker)**
VedaAI uses **Docker Compose** to run both the database (MongoDB) and task broker (Redis) in fully isolated Linux containers.

1. Make sure **Docker Desktop** is open and active (verify that the engine icon in the bottom-left is green/Running).
2. Open a terminal inside your repository root folder and start the services:
```bash
docker compose up -d
```
This single command spins up:
- **`mongodb-vedaai`**: MongoDB running on default port `27017` with persistent volume storage (`mongo_data`).
- **`redis-vedaai`**: Redis running on default port `6379` backed by the lightweight Alpine image.

*(To stop both database services later, simply run `docker compose down` in your root folder).*

---

### **Step 3: Launch the Backend Server**
Open a new terminal window, navigate to the `/backend` folder, install dependencies, and launch the API server and BullMQ background worker:
```bash
cd backend
npm install
npm run dev
```
👉 Look for: `[VedaAI] Server is actively running on port 5000` and `Assignment BullMQ Worker initialized`.

---

### **Step 4: Launch the Frontend Portal**
Open a separate terminal window, navigate to the `/frontend` folder, install dependencies, and launch the Next.js App Router:
```bash
cd frontend
npm install
npm run dev
```
👉 Look for: `Local: http://localhost:3000` and `✓ Ready`. Open your browser and navigate to **`http://localhost:3000`** to view and test all features!

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
