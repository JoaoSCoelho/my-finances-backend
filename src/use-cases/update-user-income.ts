import { IIncomeObject, Income } from '../entities/income';
import { InvalidParamError } from '../errors/invalid-param-error';
import { ServerError } from '../errors/server-error';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import { BankAccountsRepository } from '../external/ports/bank-accounts-repository';
import { IncomesRepository } from '../external/ports/incomes-repository';
import { AnyString } from '../object-values/any-string';
import { ID } from '../object-values/id';
import { NoNegativeAmount } from '../object-values/no-negative-amount';
import { TransactionTitle } from '../object-values/transaction-title';
import { Either, left, right } from '../shared/either';

export class UpdateUserIncomeUC {
  constructor(
    private incomesRepository: IncomesRepository,
    private bankAccountsRepository: BankAccountsRepository,
  ) {}

  async execute(
    userID: string,
    incomeID: string,
    data: Partial<
      Pick<IIncomeObject, 'gain' | 'description' | 'title' | 'bankAccountId'>
    >,
  ): Promise<
    Either<
      ThereIsNoEntityWithThisPropError | InvalidParamError | ServerError,
      Income
    >
  > {
    const eitherIncomeObject = await this.incomesRepository.findWithThisProps({
      id: incomeID,
    });

    if (eitherIncomeObject.isLeft())
      return left(
        new ThereIsNoEntityWithThisPropError('income', 'id', incomeID),
      );

    const incomeObject = eitherIncomeObject.value;

    const existsBankAccount = await this.bankAccountsRepository.exists({
      id: incomeObject.bankAccountId,
      userId: userID,
    });

    if (!existsBankAccount)
      return left(
        new ThereIsNoEntityWithThisPropError('income', 'id', incomeID),
      );

    const eitherGain = NoNegativeAmount.create(data.gain);

    if ('gain' in data && eitherGain.isLeft())
      return left(
        new InvalidParamError(
          'gain',
          data.gain,
          eitherGain.value.reason,
          eitherGain.value.expected,
        ),
      );

    const eitherTitle = TransactionTitle.create(data.title);

    if ('title' in data && eitherTitle.isLeft())
      return left(
        new InvalidParamError(
          'title',
          data.title,
          eitherTitle.value.reason,
          eitherTitle.value.expected,
        ),
      );

    const eitherDescription = AnyString.create(data.description);

    if ('description' in data && eitherDescription.isLeft())
      return left(
        new InvalidParamError(
          'description',
          data.description,
          eitherDescription.value.reason,
          eitherDescription.value.expected,
        ),
      );

    const eitherBankAccountId = ID.create(data.bankAccountId);

    if ('bankAccountId' in data) {
      if (eitherBankAccountId.isLeft())
        return left(
          new InvalidParamError(
            'bankAccountId',
            data.bankAccountId,
            eitherBankAccountId.value.reason,
            eitherBankAccountId.value.expected,
          ),
        );
      else {
        const existsNewBankAccount = await this.bankAccountsRepository.exists({
          id: data.bankAccountId,
          userId: userID,
        });

        if (!existsNewBankAccount)
          return left(
            new ThereIsNoEntityWithThisPropError(
              'bankAccount',
              'id',
              data.bankAccountId,
            ),
          );
      }
    }

    const eitherUpdatedIncomeObject = await this.incomesRepository.update(
      incomeID,
      data,
    );

    if (eitherUpdatedIncomeObject.isLeft()) return left(new ServerError());

    const updatedIncomeObject = eitherUpdatedIncomeObject.value;

    const eitherIncome = Income.create(updatedIncomeObject);

    if (eitherIncome.isLeft()) return left(new ServerError());

    const income = eitherIncome.value;

    return right(income);
  }
}
