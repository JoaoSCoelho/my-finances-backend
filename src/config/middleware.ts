import { Express } from 'express';

import { bodyParser } from '../default-middlewares/body-parser';
import { cors } from '../default-middlewares/cors';
import { limiter } from '../default-middlewares/default-rate-limit';

export const middleware = (app: Express): void => {
  app.use(bodyParser);
  app.use(cors);
  app.use(limiter({ max: 60 }));
};
