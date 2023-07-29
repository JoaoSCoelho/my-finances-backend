import rateLimit, { Options } from 'express-rate-limit';

export const limiter = (options: Partial<Options>) =>
  rateLimit({
    max: 20,
    windowMs: 60 * 1000, // 1 minute
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    message: { message: 'Too many requests, please try again later.' },
    legacyHeaders: true, // Enable the `X-RateLimit-*` headers
    skip: () => process.env.NODE_ENV === 'test',
    ...options,
  });
