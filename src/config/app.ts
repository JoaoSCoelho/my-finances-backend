import 'dotenv/config';
import express from 'express';

import { middleware } from './middleware';
import { router } from './routes';

const app = express();

middleware(app);
app.use(router);

export { app };
