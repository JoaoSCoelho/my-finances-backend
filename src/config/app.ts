import 'dotenv/config';
import express from 'express';

import { middleware } from './middleware';
import { connect } from './mongo';
import { router } from './routes';

const app = express();

// Mongo connection
connect();

middleware(app);
app.use(router);

export { app };
