import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || env.CORS_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
if (env.NODE_ENV !== 'test')
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;