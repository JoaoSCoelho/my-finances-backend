import { Router } from 'express';

import { adaptRoute } from '../adapters/route-adapter';
import { makeAuthMiddleware } from '../factories/auth-middleware';
import { makeConfirmEmailController } from '../factories/confirm-email-controller';
import { makeCreateBankAccountController } from '../factories/create-bank-account-controller';
import { makeCreateExpenseController } from '../factories/create-expense';
import { makeCreateUserController } from '../factories/create-user-controller';
import { makeDeleteUserBankAccountController } from '../factories/delete-user-bank-account-controller';
import { makeLoginController } from '../factories/login-controller';
import { makeMeController } from '../factories/me-controller';
import { makeMyBankAccountsController } from '../factories/my-bank-accounts-controller';
import { makeUpdateUserBankAccountController } from '../factories/update-user-bank-account-controller';

const router = Router();

router.post('/api/login', adaptRoute(makeLoginController()));
router.post('/api/users', adaptRoute(makeCreateUserController()));
router.get(
  '/api/confirmemail/:token',
  adaptRoute(makeConfirmEmailController()),
);
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
router.put(
  '/api/bankaccounts/:id',
  adaptRoute(makeAuthMiddleware()),
  adaptRoute(makeUpdateUserBankAccountController()),
);
router.delete(
  '/api/bankaccounts/:id',
  adaptRoute(makeAuthMiddleware()),
  adaptRoute(makeDeleteUserBankAccountController()),
);
router.post(
  '/api/bankaccounts/:id/',
  adaptRoute(makeAuthMiddleware()),
  adaptRoute(makeCreateExpenseController()),
);

console.log('→ Loaded routes');

export { router };
