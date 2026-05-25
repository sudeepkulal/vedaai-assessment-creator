import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { connectDB } from './config/db';
import { initSocket } from './sockets/socketHandler';
import { initAssignmentWorker } from './workers/assignmentWorker';
import assignmentRoutes from './routes/assignmentRoutes';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize DB Connection
connectDB();

// Initialize Socket.io Server
initSocket(server);

// Initialize Background BullMQ Worker
initAssignmentWorker();

app.use(cors());
app.use(express.json());

// Routes Setup
app.use('/api/assignments', assignmentRoutes);

app.get('/health', (req, res) => {
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
