import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';

let io: SocketServer | null = null;

export const initSocket = (server: HttpServer): SocketServer => {
  io = new SocketServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    // Join a room specific to an assignment ID for scoped updates
    socket.on('join-assignment', (assignmentId: string) => {
      socket.join(assignmentId);
      console.log(`Socket ${socket.id} joined room: ${assignmentId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getSocketIO = (): SocketServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call initSocket first!');
  }
  return io;
};
