import { IApiEnv } from './ports/env';

// Check if exists all required env's

if (!process.env.PORT || isNaN(Number(process.env.PORT)))
  throw console.error('Missing env PORT');

export const apiEnv: IApiEnv = {
  PORT: Number(process.env.PORT || 3000),
};
