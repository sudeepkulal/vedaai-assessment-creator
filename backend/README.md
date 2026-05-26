# VedaAI Assessment Creator - Backend ⚙️

The VedaAI Assessment Creator backend is a Node/Express REST API and Socket.io server written in TypeScript. It uses MongoDB (Mongoose) for persistence, and BullMQ + Redis for asynchronous background AI assessment generation jobs, streaming progress live to clients.

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
