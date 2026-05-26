import 'dotenv/config';
import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { logger } from './config/logger';

async function bootstrap() {
  // Verify DB connection on startup
  await prisma.$connect();
  logger.info('Database connected');

  const { httpServer } = createApp();

  httpServer.listen(env.API_PORT, () => {
    logger.info(`🚀  Cykle API running on port ${env.API_PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    await prisma.$disconnect();
    httpServer.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
