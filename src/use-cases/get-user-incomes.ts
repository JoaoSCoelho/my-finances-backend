import { Income } from '../entities/income';
import { ServerError } from '../errors/server-error';
import { BankAccountsRepository } from '../external/ports/bank-accounts-repository';
import { IncomesRepository } from '../external/ports/incomes-repository';
import { Either, left, right } from '../shared/either';

export class GetUserIncomesUC {
  constructor(
    private incomesRepository: IncomesRepository,
    private bankAccountsRepository: BankAccountsRepository,
  ) {}

  async execute(userId: string): Promise<Either<ServerError, Income[]>> {
    const bankAccountsObjects =
      await this.bankAccountsRepository.filterWithThisProps({ userId });

    const incomesObjects = (
      await Promise.all(
        bankAccountsObjects.map(async (bankAccountObject) => {
          return await this.incomesRepository.filterWithThisProps({
            bankAccountId: bankAccountObject.id,
          });
        }),
      )
    ).reduce((prev, curr) => prev.concat(curr), []);

    const eitherIncomes = incomesObjects.map((incomeObject) =>
      Income.create(incomeObject),
    );

    if (eitherIncomes.some((eitherIncome) => eitherIncome.isLeft()))
      return left(new ServerError());

    const incomes = eitherIncomes.map(
      (eitherIncome) => eitherIncome.value as Income,
    );

    return right(incomes);
  }
}
