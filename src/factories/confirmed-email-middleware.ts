import { ConfirmedEmailMiddleware } from '../adapters/middlewares/confirmed-email';

export function makeConfirmedEmailMiddleware() {
  const confirmedEmailMiddleware = new ConfirmedEmailMiddleware();

  return confirmedEmailMiddleware;
}
