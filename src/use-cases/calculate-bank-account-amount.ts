import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import { BankAccountsRepository } from '../external/ports/bank-accounts-repository';
import { ExpensesRepository } from '../external/ports/expenses-repository';
import { IncomesRepository } from '../external/ports/incomes-repository';
import { TransfersRepository } from '../external/ports/transfers-repository';
import { Either, left, right } from '../shared/either';

export class CalculateBankAccountAmountUC {
  constructor(
    private bankAccountRepository: BankAccountsRepository,
    private incomesRepository: IncomesRepository,
    private expensesRepository: ExpensesRepository,
    private transfersRepository: TransfersRepository,
  ) {}

  async execute(
    bankAccountId: string,
  ): Promise<Either<ThereIsNoEntityWithThisPropError, number>> {
    const eitherBankAccountObject =
      await this.bankAccountRepository.findWithThisProps({ id: bankAccountId });

    if (eitherBankAccountObject.isLeft())
      return left(
        new ThereIsNoEntityWithThisPropError(
          'bankAccount',
          'id',
          bankAccountId,
        ),
      );

    const bankAccountObject = eitherBankAccountObject.value;
    const incomesObjects = await this.incomesRepository.filterWithThisProps({
      bankAccountId,
    });
    const expensesObjects = await this.expensesRepository.filterWithThisProps({
      bankAccountId,
    });
    const receivedTransfersObjects =
      await this.transfersRepository.filterWithThisProps({
        receiverBankAccountId: bankAccountId,
      });
    const givenTransfersObjects =
      await this.transfersRepository.filterWithThisProps({
        giverBankAccountId: bankAccountId,
      });

    const incomesTotal = incomesObjects.reduce(
      (prev, curr) => prev + curr.gain,
      0,
    );

    const expensesTotal = expensesObjects.reduce(
      (prev, curr) => prev + curr.spent,
      0,
    );
    const receivedTransfersTotal = receivedTransfersObjects.reduce(
      (prev, curr) => prev + curr.amount,
      0,
    );
    const givenTransfersTotal = givenTransfersObjects.reduce(
      (prev, curr) => prev + curr.amount,
      0,
    );

    const bankAccountAmount =
      bankAccountObject.initialAmount +
      incomesTotal +
      receivedTransfersTotal -
      expensesTotal -
      givenTransfersTotal;

    return right(bankAccountAmount);
  }
}
