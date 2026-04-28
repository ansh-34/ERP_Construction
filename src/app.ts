import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { corsConfig, swaggerSpec } from '@/config/index';
import passportService from './services/passport.service';
import router from './modules/router';

const app = express();

passportService.initialize();
app.use(cors(corsConfig));
app.use(helmet());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', router);

export default app;

