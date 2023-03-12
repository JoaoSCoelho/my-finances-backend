import { Router } from 'express';

import { adaptRoute } from '../adapters/route-adapter';
import { makeAuthMiddleware } from '../factories/auth-middleware';
import { makeCreateUserController } from '../factories/create-user-controller';
import { makeMeController } from '../factories/me-controller';

const router = Router();

router.post('/api/users', adaptRoute(makeCreateUserController()));
router.get(
  '/api/users/me',
  adaptRoute(makeAuthMiddleware()),
  adaptRoute(makeMeController()),
);

console.log('→ Loaded routes');

export { router };
