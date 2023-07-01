import { Router } from 'express';

import { adaptRoute } from '../adapters/route-adapter';
import { limiter } from '../default-middlewares/default-rate-limit';
import { makeAuthMiddleware } from '../factories/auth-middleware';
import { makeConfirmEmailController } from '../factories/confirm-email-controller';
import { makeConfirmedEmailMiddleware } from '../factories/confirmed-email-middleware';
import { makeCreateBankAccountController } from '../factories/create-bank-account-controller';
import { makeCreateExpenseController } from '../factories/create-expense';
import { makeCreateIncomeController } from '../factories/create-income-controller';
import { makeCreateTransferController } from '../factories/create-transfer-controller';
import { makeCreateUserController } from '../factories/create-user-controller';
import { makeDeleteMyExpenseController } from '../factories/delete-my-expense-controller';
import { makeDeleteMyIncomeController } from '../factories/delete-my-income-controller';
import { makeDeleteMyTransferController } from '../factories/delete-my-transfer-controller';
import { makeDeleteUserBankAccountController } from '../factories/delete-user-bank-account-controller';
import { makeGetMyExpensesController } from '../factories/get-my-expenses-controller';
import { makeGetMyIncomesController } from '../factories/get-my-incomes-controller';
import { makeGetMyTransfersController } from '../factories/get-my-transfers-controller';
import { makeLoginController } from '../factories/login-controller';
import { makeMeController } from '../factories/me-controller';
import { makeMyBankAccountsController } from '../factories/my-bank-accounts-controller';
import { makeRefreshTokenController } from '../factories/refresh-token-controller';
import { makeResendEmailConfirmation } from '../factories/resend-email-confirmation-controller';
import { makeUpdateMeController } from '../factories/update-me-controller';
import { makeUpdateMyExpenseController } from '../factories/update-my-expense-controller';
import { makeUpdateMyIncomeController } from '../factories/update-my-income-controller';
import { makeUpdateMyTransferController } from '../factories/update-my-transfer-controller';
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
router.put(
  '/api/transactions/expenses/:id',
  adaptRoute(makeAuthMiddleware()),
  adaptRoute(makeConfirmedEmailMiddleware()),
  adaptRoute(makeUpdateMyExpenseController()),
);
router.delete(
  '/api/transactions/expenses/:id',
  adaptRoute(makeAuthMiddleware()),
  adaptRoute(makeConfirmedEmailMiddleware()),
  adaptRoute(makeDeleteMyExpenseController()),
);
router.post(
  '/api/transactions/incomes',
  adaptRoute(makeAuthMiddleware()),
  adaptRoute(makeConfirmedEmailMiddleware()),
  adaptRoute(makeCreateIncomeController()),
);
router.get(
  '/api/transactions/incomes',
  adaptRoute(makeAuthMiddleware()),
  adaptRoute(makeGetMyIncomesController()),
);
router.put(
  '/api/transactions/incomes/:id',
  adaptRoute(makeAuthMiddleware()),
  adaptRoute(makeConfirmedEmailMiddleware()),
  adaptRoute(makeUpdateMyIncomeController()),
);
router.delete(
  '/api/transactions/incomes/:id',
  adaptRoute(makeAuthMiddleware()),
  adaptRoute(makeConfirmedEmailMiddleware()),
  adaptRoute(makeDeleteMyIncomeController()),
);
router.post(
  '/api/transactions/transfers',
  adaptRoute(makeAuthMiddleware()),
  adaptRoute(makeConfirmedEmailMiddleware()),
  adaptRoute(makeCreateTransferController()),
);
router.get(
  '/api/transactions/transfers',
  adaptRoute(makeAuthMiddleware()),
  adaptRoute(makeGetMyTransfersController()),
);
router.put(
  '/api/transactions/transfers/:id',
  adaptRoute(makeAuthMiddleware()),
  adaptRoute(makeConfirmedEmailMiddleware()),
  adaptRoute(makeUpdateMyTransferController()),
);
router.delete(
  '/api/transactions/transfers/:id',
  adaptRoute(makeAuthMiddleware()),
  adaptRoute(makeConfirmedEmailMiddleware()),
  adaptRoute(makeDeleteMyTransferController()),
);

console.log('→ Loaded routes');

export { router };
