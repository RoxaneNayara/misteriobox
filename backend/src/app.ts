import cors from 'cors';
import express, { type Express } from 'express';
import { env } from './config/env';
import { requireJsonContentType } from './middlewares/content-type';
import { errorHandler, notFoundHandler } from './middlewares/error-handler';
import { noStore } from './middlewares/no-store';
import { docsRoutes } from './routes/docs.routes';
import { apiRoutes } from './routes';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors({ origin: env.corsOrigins }));
  // B06: o tipo de mídia é validado antes da leitura do corpo.
  app.use('/api', requireJsonContentType);
  app.use(express.json({ limit: '100kb' }));

  app.use('/api-docs', docsRoutes);
  app.use('/api', noStore, apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
