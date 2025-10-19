import express, { Application } from 'express';
import { createServer } from 'http';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { initializeMinIO } from './config/minio';
import { globalLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import { socketService } from './services/socketService';
import { cacheService } from './services/cacheService';
import { queueService } from './services/queueService';
import { emailService } from './services/emailService';
import { initializeEmailWorker } from './workers/emailWorker';
import { initializeTaskReminderWorker } from './workers/taskReminderWorker';

// Import routes
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';
import commentRoutes from './routes/commentRoutes';
import fileRoutes from './routes/fileRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import userRoutes from './routes/userRoutes';

const app: Application = express();
const httpServer = createServer(app);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Compression
app.use(compression());

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Rate limiting
app.use(globalLimiter);

// Health check route
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', commentRoutes); // Includes /api/tasks/:id/comments and /api/comments/:id
app.use('/api', fileRoutes); // Includes /api/tasks/:id/files and /api/files/:id
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
    },
  });
});

// Global error handler
app.use(errorHandler);

// Initialize and start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Initialize MinIO
    await initializeMinIO();

    // Initialize Redis cache (optional)
    cacheService.initialize();

    // Initialize queue system (optional)
    queueService.initialize();

    // Initialize email service (optional)
    emailService.initialize();

    // Initialize workers (optional)
    initializeEmailWorker();
    initializeTaskReminderWorker();

    // Initialize WebSocket
    socketService.initialize(httpServer);

    // Start server
    const PORT = env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 Server is running on port ${PORT}`);
      console.log(`📡 Environment: ${env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
