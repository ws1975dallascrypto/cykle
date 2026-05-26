import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import routes from './routes';
import { SOCKET_EVENTS } from '@cykle/shared';

export function createApp() {
  const app = express();
  const httpServer = createServer(app);

  const io = new SocketIOServer(httpServer, {
    cors: { origin: env.CORS_ORIGINS, credentials: true },
    transports: ['websocket', 'polling'],
  });

  // ── Security ──────────────────────────────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ── General middleware ────────────────────────────────────────────────────
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', { stream: { write: (msg) => logger.info(msg.trim()) } }));

  // ── Rate limiting ─────────────────────────────────────────────────────────
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: env.NODE_ENV === 'production' ? 100 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', limiter);

  // ── Routes ────────────────────────────────────────────────────────────────
  app.use('/api/v1', routes);

  // ── Error handlers ────────────────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  // ── Socket.io: Real-time order tracking ───────────────────────────────────
  io.on('connection', (socket) => {
    logger.debug(`Socket connected: ${socket.id}`);

    socket.on(SOCKET_EVENTS.JOIN_ROOM, (roomId: string) => {
      socket.join(roomId);
    });

    socket.on(SOCKET_EVENTS.LEAVE_ROOM, (roomId: string) => {
      socket.leave(roomId);
    });

    // Driver broadcasts their GPS position (rate-limited client-side)
    socket.on(SOCKET_EVENTS.DRIVER_LOCATION_UPDATED, (payload: { orderId: string; lat: number; lng: number }) => {
      // Broadcast to all clients watching this order
      io.to(`order:${payload.orderId}`).emit(SOCKET_EVENTS.DRIVER_LOCATION_UPDATED, payload);
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  // Attach io instance so controllers can emit events
  app.set('io', io);

  return { app, httpServer, io };
}
