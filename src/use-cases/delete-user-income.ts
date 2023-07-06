import { IIncomeObject } from '../entities/income';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import { BankAccountsRepository } from '../external/ports/bank-accounts-repository';
import { IncomesRepository } from '../external/ports/incomes-repository';
import { Either, left, right } from '../shared/either';

export class DeleteUserIncomeUC {
  constructor(
    private incomesRepository: IncomesRepository,
    private bankAccountsRepository: BankAccountsRepository,
  ) {}

  async execute(
    userID: string,
    incomeID: string,
  ): Promise<Either<ThereIsNoEntityWithThisPropError, IIncomeObject>> {
    const eitherIncomeObject = await this.incomesRepository.findWithThisProps({
      id: incomeID,
    });

    if (eitherIncomeObject.isLeft())
      return left(
        new ThereIsNoEntityWithThisPropError('income', 'id', incomeID),
      );

    const incomeObject = eitherIncomeObject.value;

    const existsBankAccount = await this.bankAccountsRepository.exists({
      userId: userID,
      id: incomeObject.bankAccountId,
    });

    if (!existsBankAccount)
      return left(
        new ThereIsNoEntityWithThisPropError('income', 'id', incomeID),
      );

    await this.incomesRepository.delete(incomeID);

    return right(incomeObject);
  }
}
