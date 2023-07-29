import { IBankAccountObject } from '../entities/bank-account';
import { ServerError } from '../errors/server-error';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import { BankAccountsRepository } from '../external/ports/bank-accounts-repository';
import { ExpensesRepository } from '../external/ports/expenses-repository';
import { IncomesRepository } from '../external/ports/incomes-repository';
import { TransfersRepository } from '../external/ports/transfers-repository';
import { TransactionTitle } from '../object-values/transaction-title';
import { Either, left, right } from '../shared/either';
import { CreateExpenseUC } from './create-expense';
import { CreateIncomeUC } from './create-income';

export class DeleteUserBankAccountUC {
  constructor(
    private bankAccountsRepository: BankAccountsRepository,
    private incomesRepository: IncomesRepository,
    private expensesRepository: ExpensesRepository,
    private transfersRepository: TransfersRepository,
    private createIncomeUC: CreateIncomeUC,
    private createExpenseUC: CreateExpenseUC,
  ) {}

  async execute(
    userId: string,
    id: string,
  ): Promise<
    Either<ThereIsNoEntityWithThisPropError | ServerError, IBankAccountObject>
  > {
    const userBankAccounts =
      await this.bankAccountsRepository.filterWithThisProps({
        userId,
      });
    const findedBankAccounts = userBankAccounts.filter(
      (bankAccount) => bankAccount.id === id,
    );

    if (findedBankAccounts.length > 1) return left(new ServerError());

    if (findedBankAccounts.length < 1)
      return left(
        new ThereIsNoEntityWithThisPropError('bankAccount', 'id', id),
      );

    const [bankAccount] = findedBankAccounts;
    const userBankAccountsIds = userBankAccounts.map(
      (bankAccount) => bankAccount.id,
    );

    // Delete incomes and expenses of this bankAccount
    await this.incomesRepository.bulkDelete({ bankAccountId: id });
    await this.expensesRepository.bulkDelete({ bankAccountId: id });

    const thisBankAccountIsGiverTransfers =
      await this.transfersRepository.filterWithThisProps({
        giverBankAccountId: bankAccount.id,
      });

    const thisBankAccountIsReceiverTransfers =
      await this.transfersRepository.filterWithThisProps({
        receiverBankAccountId: bankAccount.id,
      });

    const bothBankAccountsWillBeDeletedTransfers =
      thisBankAccountIsGiverTransfers
        .filter(
          (transfer) =>
            !userBankAccountsIds.includes(transfer.receiverBankAccountId),
        )
        .concat(
          thisBankAccountIsReceiverTransfers.filter(
            (transfer) =>
              !userBankAccountsIds.includes(transfer.giverBankAccountId),
          ),
        );

    const bothBankAccountsWillBeDeletedTransfersIds =
      bothBankAccountsWillBeDeletedTransfers.map((transfer) => transfer.id);

    // Deleta transferências em que tanto o bankAccount atual quanto o seu par foram/serão deletados
    await this.transfersRepository.filterInThisIds(
      bothBankAccountsWillBeDeletedTransfersIds,
    );

    const shouldTransformToANewIncomeTransfers =
      thisBankAccountIsGiverTransfers.filter(
        (transfer) =>
          !bothBankAccountsWillBeDeletedTransfersIds.includes(
            transfer.receiverBankAccountId,
          ),
      );

    const shouldTransformToANewExpenseTransfers =
      thisBankAccountIsReceiverTransfers.filter(
        (transfer) =>
          !bothBankAccountsWillBeDeletedTransfersIds.includes(
            transfer.giverBankAccountId,
          ),
      );

    function makeAutoTransactionTitle(transferTitle: string) {
      return `(${transferTitle.slice(
        0,
        TransactionTitle.maximumLength - 31, // 31 é a quantidade de caracteres do título base
      )}) -- TRANSFERÊNCIA DELETADA --`;
    }

    // Cria novas receitas para suprir a falta da transferência que existia
    await Promise.all(
      shouldTransformToANewIncomeTransfers.map((transfer) =>
        this.createIncomeUC.execute(
          {
            bankAccountId: transfer.receiverBankAccountId,
            description: transfer.description,
            gain: transfer.amount,
            title: makeAutoTransactionTitle(transfer.title),
          },
          userId,
        ),
      ),
    );

    // Cria novas despesas para suprir a falta da transferência que existia
    await Promise.all(
      shouldTransformToANewExpenseTransfers.map((transfer) =>
        this.createExpenseUC.execute(
          {
            bankAccountId: transfer.giverBankAccountId,
            description: undefined,
            spent: transfer.amount,
            title: makeAutoTransactionTitle(transfer.title),
          },
          userId,
        ),
      ),
    );

    // Delete todas as transações dessa conta bancária
    await this.transfersRepository.bulkDeleteWithThisPossibilities([
      { giverBankAccountId: id },
      { receiverBankAccountId: id },
    ]);

    await this.bankAccountsRepository.delete(id);

    return right(bankAccount);
  }
}
