import { IApiEnv } from './ports/env';

// Check if exists all required env's

if (!process.env.PORT || isNaN(Number(process.env.PORT)))
  throw console.error('Missing env PORT');
if (!process.env.MONGO_URI) throw console.error('Missing env MONGO_URI');

export const apiEnv: IApiEnv = {
  PORT: Number(process.env.PORT || 3000),
  MONGO_URI: process.env.MONGO_URI,
};
