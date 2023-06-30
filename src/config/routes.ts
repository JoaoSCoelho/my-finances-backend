import { Router } from 'express';

import { adaptRoute } from '../adapters/route-adapter';
import { limiter } from '../default-middlewares/default-rate-limit';
import { makeAuthMiddleware } from '../factories/auth-middleware';
import { makeConfirmEmailController } from '../factories/confirm-email-controller';
import { makeConfirmedEmailMiddleware } from '../factories/confirmed-email-middleware';
import { makeCreateBankAccountController } from '../factories/create-bank-account-controller';
import { makeCreateExpenseController } from '../factories/create-expense';
import { makeCreateUserController } from '../factories/create-user-controller';
import { makeDeleteUserBankAccountController } from '../factories/delete-user-bank-account-controller';
import { makeGetMyExpensesController } from '../factories/get-my-expenses-controller';
import { makeLoginController } from '../factories/login-controller';
import { makeMeController } from '../factories/me-controller';
import { makeMyBankAccountsController } from '../factories/my-bank-accounts-controller';
import { makeRefreshTokenController } from '../factories/refresh-token-controller';
import { makeResendEmailConfirmation } from '../factories/resend-email-confirmation-controller';
import { makeUpdateMeController } from '../factories/update-me-controller';
import { makeUpdateUserBankAccountController } from '../factories/update-user-bank-account-controller';

const router = Router();

router.post('/api/login', adaptRoute(makeLoginController()));
router.post('/api/users', adaptRoute(makeCreateUserController()));
router.post('/api/auth/refreshtoken', adaptRoute(makeRefreshTokenController()));

router.get(
  '/api/users/me',
  adaptRoute(makeAuthMiddleware()),
  adaptRoute(makeMeController()),
);
router.post(
  '/api/users/me/resend/emailconfirmation',
  limiter({ max: 1, windowMs: 1000 * 60 * 15 }),
  adaptRoute(makeAuthMiddleware()),
  adaptRoute(makeResendEmailConfirmation()),
);
router.put(
  '/api/users/me',
  adaptRoute(makeAuthMiddleware()),
  adaptRoute(makeConfirmedEmailMiddleware()),
  adaptRoute(makeUpdateMeController()),
);
router.get(
  '/api/confirmemail/:token',
  adaptRoute(makeConfirmEmailController()),
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
  '/api/transactions/expenses',
  adaptRoute(makeAuthMiddleware()),
  adaptRoute(makeConfirmedEmailMiddleware()),
  adaptRoute(makeCreateExpenseController()),
);
router.get(
  '/api/transactions/expenses',
  adaptRoute(makeAuthMiddleware()),
  adaptRoute(makeGetMyExpensesController()),
);

console.log('→ Loaded routes');

export { router };
