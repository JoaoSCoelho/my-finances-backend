import { Router } from 'express';

import { adaptRoute } from '../adapters/route-adapter';
import { makeAuthMiddleware } from '../factories/auth-middleware';
import { makeCreateBankAccountController } from '../factories/create-bank-account-controller';
import { makeCreateUserController } from '../factories/create-user-controller';
import { makeLoginController } from '../factories/login-controller';
import { makeMeController } from '../factories/me-controller';
import { makeMyBankAccountsController } from '../factories/my-bank-accounts-controller';

const router = Router();

router.post('/api/login', adaptRoute(makeLoginController()));
router.post('/api/users', adaptRoute(makeCreateUserController()));
router.get(
  '/api/users/me',
  adaptRoute(makeAuthMiddleware()),
  adaptRoute(makeMeController()),
);

router.post(
  '/api/bankaccounts',
  adaptRoute(makeAuthMiddleware()),
  adaptRoute(makeCreateBankAccountController()),
);
router.get(
  '/api/bankaccounts/my',
  adaptRoute(makeAuthMiddleware()),
  adaptRoute(makeMyBankAccountsController()),
);

console.log('→ Loaded routes');

export { router };
