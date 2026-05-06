import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { corsConfig, swaggerSpec, limiter, variables } from './config/index.js';
import router from './modules/router.js';
import { requestLogger } from './middlewares/logger.js';

const app = express();

app.use(cors(corsConfig));
app.use(helmet());

app.use(limiter);

app.use(express.json({ limit: variables.MAX_REQUEST_SIZE }));
app.use(
  express.urlencoded({ limit: variables.MAX_REQUEST_SIZE, extended: true }),
);
app.use(cookieParser());

// Enable API logging
if (variables.LOGS_ENABLE === 'true') {
  app.use(requestLogger);
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api', router);

export default app;
