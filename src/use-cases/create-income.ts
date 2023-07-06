import { Income } from '../entities/income';
import { InvalidParamError } from '../errors/invalid-param-error';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import { BankAccountsRepository } from '../external/ports/bank-accounts-repository';
import { GeneratorIDProvider } from '../external/ports/generator-id-provider';
import { IncomesRepository } from '../external/ports/incomes-repository';
import { Either, left, right } from '../shared/either';

export interface ICreateIncomeDTO {
  description: string;
  gain: number;
  bankAccountId: string;
  title: string;
}

export class CreateIncomeUC {
  constructor(
    private bankAccountsRepository: BankAccountsRepository,
    private incomesRepository: IncomesRepository,
    private generatorIDProvider: GeneratorIDProvider,
  ) {}

  async execute(
    data: Record<keyof ICreateIncomeDTO, any>,
    userID: string,
  ): Promise<
    Either<InvalidParamError | ThereIsNoEntityWithThisPropError, Income>
  > {
    const eitherIncome = Income.create({
      id: this.generatorIDProvider.generate(),
      description: data.description,
      bankAccountId: data.bankAccountId,
      gain: data.gain,
      createdTimestamp: Date.now(),
      title: data.title,
    });

    if (eitherIncome.isLeft()) return left(eitherIncome.value);

    const income = eitherIncome.value;

    const existsBankAccount = await this.bankAccountsRepository.exists({
      id: income.bankAccountId.value,
      userId: userID,
    });

    if (!existsBankAccount)
      return left(
        new ThereIsNoEntityWithThisPropError(
          'bankAccount',
          'id',
          income.bankAccountId.value,
        ),
      );

    await this.incomesRepository.set(income.value);

    return right(income);
  }
}
