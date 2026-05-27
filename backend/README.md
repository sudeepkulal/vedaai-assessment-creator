# VedaAI Assessment Creator - Backend ⚙️

**🔗 Live Demo / Production Link:** [vedaai-assessment-creator-seven.vercel.app](https://vedaai-assessment-creator-seven.vercel.app/)

The VedaAI Assessment Creator backend is a Node/Express REST API and Socket.io server written in TypeScript. It uses MongoDB (Mongoose) for persistence, and BullMQ + Redis for asynchronous background AI assessment generation jobs, streaming progress live to clients.

---

## 💎 Elite Backend Features & System Design Architecture

1. **Robust Decoupled Job Queue (BullMQ over Redis)**:
   - Offloads compute-heavy and latency-variable AI synthesis tasks from the main Express HTTP thread.
   - Pushes serialized parameter inputs into a high-performance **Redis key-value broker** utilizing **BullMQ**.
   - Background workers pick up tasks with a concurrency rate of `2`, enabling multi-threaded execution scaling.

2. **WebSockets Event Broadcasting (Socket.io Rooms)**:
   - Eliminates client HTTP polling! When a task begins, clients subscribe to a room named after their assignment ID.
   - The worker dynamically broadcasts progress events (`generation-started`, `generation-progress` at `40%`/`70%`, and `generation-completed` / `generation-failed`) to keep clients updated in real time.

3. **Google Gemini Generative AI SDK & Schema Enforcement**:
   - Integrated with the Google Generative AI Node SDK using the active **`gemini-2.5-flash`** model.
   - Enforces a rigorous JSON schema prompt requiring a strict section/question array structure.
   - Includes a post-generation validation system (`parseAndValidateResponse`) that strips markdown wrapper blocks, verifies essential properties, and guarantees structure integrity.

4. **Dynamic High-Fidelity Mock AI Fallback Engine (Offline Resilience)**:
   - Features a fail-safe offline mode. If `GEMINI_API_KEY` is undefined or configured to `MOCK_KEY`, the server warns but boots fully, supplying high-fidelity topic-customized mock evaluations.
   - This provides developers and recruiters with a 100% offline-ready, self-contained development ecosystem.

5. **Optimized Mongoose Schemas & Database Indexing**:
   - Standardizes data formats with Mongoose models representing nested `QuestionSchema` models inside parent `AssignmentSchema` collections.
   - **Text-Search Indexing**: Elevates query performance by indexing `title` and `topic` fields as database-level text search vectors (`AssignmentSchema.index({ title: 'text', topic: 'text' })`).

6. **Decoupled Service Layers**:
   - Adheres to clean domain-driven architecture separating REST Controller endpoints, DB business service handlers, AI prompts compilation modules, and worker task ingestion components.

---

## 🛠️ Backend Code Map: Implementation Reference

Direct the interviewer to the core backend operations using these file pointers:

| Module / Component | System Responsibility | Implementation File Location |
| :--- | :--- | :--- |
| **MongoDB Model & Index** | Defines assignment schemas, nested question types, and database search indexes | [`src/models/Assignment.ts`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/backend/src/models/Assignment.ts) |
| **Task Queue Producer** | Connects to Redis and serializes and registers background BullMQ jobs | [`src/queues/assignmentQueue.ts`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/backend/src/queues/assignmentQueue.ts) |
| **Ingestion Worker** | Consumes BullMQ tasks, triggers Socket progress ticks, and commits items to the DB | [`src/workers/assignmentWorker.ts`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/backend/src/workers/assignmentWorker.ts) |
| **AI Prompt Compiler** | Drives Gemini system instructions, strict JSON parses, and the offline fallback engine | [`src/services/aiService.ts`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/backend/src/services/aiService.ts) |
| **WebSocket Handler** | Configures Socket.io namespaces, connection sockets, and room channels | [`src/sockets/socketHandler.ts`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/backend/src/sockets/socketHandler.ts) |
| **Express DB Service** | Encapsulates database search/filter operations and triggers background queues | [`src/services/assignmentService.ts`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/backend/src/services/assignmentService.ts) |
| **Controller Route Handler** | Processes HTTP request validations and formats JSON API payloads | [`src/controllers/assignmentController.ts`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/backend/src/controllers/assignmentController.ts) |
| **Router Declarations** | Defines REST paths linking controllers to paths like `/api/assignments` | [`src/routes/assignmentRoutes.ts`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/backend/src/routes/assignmentRoutes.ts) |
| **Infrastructure Config** | Handles Redis connections, Mongo connections, and app initializations | [`src/config/`](file:///c:/Users/sudee/Coding%20adda/veda%20ai/vedaai-assessment-creator/backend/src/config) |

---

## 🚀 Setup & Installation

### **Prerequisites**
Ensure you have the following services running:
- **Node.js** (v18.0.0 or higher)
- **MongoDB Server** (Default port `27017`)
- **Redis Server** (Default port `6379`)

### **1. Install Dependencies**
From the `/backend` directory:
```bash
npm install
```

### **2. Configure Environment Variables**
Create a new file named `.env` inside this `/backend` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/vedaai
REDIS_HOST=localhost
REDIS_PORT=6379
GEMINI_API_KEY=your_google_gemini_api_key
```
> **Pro Tip**: If `GEMINI_API_KEY` is not provided or set to `MOCK_KEY`, VedaAI will automatically fall back to its local, high-fidelity offline assessment compiler so you can test generation pipelines fully offline.

### **3. Start Services**
Make sure MongoDB and Redis are actively running:
*   **MongoDB**: Verify MongoDB is running locally.
*   **Redis**: Start Redis locally or spin up a Docker container:
    ```bash
    docker run -d --name redis-vedaai -p 6379:6379 redis:alpine
    ```

### **4. Launch Development Server**
Launch the TypeScript development server and background job consumer worker:
```bash
npm run dev
```
The server will log:
- `[VedaAI] Server is actively running on port 5000`
- `[VedaAI] MongoDB database connection established`
- `[VedaAI] Redis connection broker online`
- `[VedaAI] Assignment BullMQ Worker initialized successfully`

---

## 🛠️ Main Build & Production Commands

*   **Compile TypeScript**:
    Compile the backend source code:
    ```bash
    npm run build
    ```
*   **Start Compiled Server**:
    Launch production build:
    ```bash
    npm run start
    ```

---

## 🤖 AI Core Integrations
- **Generative Engine**: Built with Google Generative AI Node.js SDK using the fully active **`gemini-2.5-flash`** model (ideal for structured, schema-validated JSON generation).
- **Asynchronous Queue Broker**: Offloads long-running AI processes to a high-speed BullMQ queue backed by Redis, ensuring API gateway responsiveness and client connection stability.
