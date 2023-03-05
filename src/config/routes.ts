import { Router } from 'express';

import { adaptRoute } from '../adapters/route-adapter';
import { makeCreateUserController } from '../factories/create-user-controller';

const router = Router();

router
  .post('/api/users', adaptRoute(makeCreateUserController()));

console.log('→ Loaded routes');

export { router };
