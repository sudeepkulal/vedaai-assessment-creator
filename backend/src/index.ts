import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import http from 'http';
import { connectDB } from './config/db';
import { initSocket } from './sockets/socketHandler';
import { initAssignmentWorker } from './workers/assignmentWorker';
import assignmentRoutes from './routes/assignmentRoutes';

const app = express();
const server = http.createServer(app);

// Initialize DB Connection
connectDB();

// Initialize Socket.io Server
initSocket(server);

// Initialize Background BullMQ Worker
initAssignmentWorker();

// CORS — allow specific origin in production, all origins in development
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no origin) and localhost in dev
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin '${origin}' is not allowed.`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

app.use(express.json());

// Routes Setup
app.use('/api/assignments', assignmentRoutes);

app.get('/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    services: {
      db: 'connected',
      sockets: 'ready',
      queues: 'active'
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[VedaAI] Server is actively running on port ${PORT}`);
});
