import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
import db from './database/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  const { method, originalUrl, ip } = req;
  console.log(`[${timestamp}] ${method} ${originalUrl} from ${ip}`);
  next();
});

// API Routes
app.use(process.env.API_PREFIX || '/api/v1', apiRoutes);

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    // Check database connection
    await db.raw('SELECT 1');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
    });
  } catch (error: unknown) {
    const errorMessage = isErrorWithMessage(error) ? error.message : 'Health check failed';
    console.error('Health check failed:', errorMessage);
    res.status(500).json({
      status: 'error',
      message: 'Service unavailable',
      ...(process.env.NODE_ENV === 'development' && { error: errorMessage }),
    });
  }
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Not Found',
  });
});

// Error handler
type ErrorWithMessage = Error & { message: string };

const isErrorWithMessage = (error: unknown): error is ErrorWithMessage => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
};

app.use(
  (err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const errorMessage = isErrorWithMessage(err) ? err.message : 'An unknown error occurred';
    console.error('Unhandled error:', errorMessage);

    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { error: errorMessage }),
    });
  }
);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}${process.env.API_PREFIX || '/api/v1'}`);
});

// Graceful shutdown
const shutdown = async (): Promise<void> => {
  console.log('Shutting down server...');

  try {
    // Close database connection
    await db.destroy();
    console.log('Database connection closed');

    // Close server
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });

    // Force close after timeout
    setTimeout(() => {
      console.error('Could not close connections in time, forcing shutdown');
      process.exit(1);
    }, 10000);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Rejection:', err);
  // Don't crash the process in production
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  // Don't crash the process in production
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});

export default server;
