import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

class SocketService {
  private io: Server | null = null;
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  public initialize(httpServer: HTTPServer): void {
    this.io = new Server(httpServer, {
      cors: {
        origin: env.CORS_ORIGIN,
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEventHandlers();

    console.log('✅ Socket.IO initialized');
  }

  private setupMiddleware(): void {
    if (!this.io) return;

    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { userId: string };

        // Verify user exists
        const user = await User.findById(decoded.userId);
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = decoded.userId;
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      const userId = socket.userId!;

      // Track user socket
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(socket.id);

      console.log(`🔌 User ${userId} connected (socket: ${socket.id})`);

      // Join user's personal room
      socket.join(`user:${userId}`);

      // Handle task room joining
      socket.on('join-task', (taskId: string) => {
        socket.join(`task:${taskId}`);
        console.log(`📋 User ${userId} joined task room: ${taskId}`);
      });

      // Handle task room leaving
      socket.on('leave-task', (taskId: string) => {
        socket.leave(`task:${taskId}`);
        console.log(`📋 User ${userId} left task room: ${taskId}`);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        const sockets = this.userSockets.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            this.userSockets.delete(userId);
          }
        }
        console.log(`🔌 User ${userId} disconnected (socket: ${socket.id})`);
      });
    });
  }

  // Emit to specific user(s)
  public emitToUser(userId: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public emitToUsers(userIds: string[], event: string, data: any): void {
    if (!this.io) return;
    userIds.forEach((userId) => {
      this.io!.to(`user:${userId}`).emit(event, data);
    });
  }

  // Emit to specific task room
  public emitToTask(taskId: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(`task:${taskId}`).emit(event, data);
  }

  // Broadcast to all connected clients
  public broadcast(event: string, data: any): void {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  // Check if user is online
  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  // Get online users count
  public getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  public getIO(): Server | null {
    return this.io;
  }
}

// Export singleton instance
export const socketService = new SocketService();
