import { Expense } from '../entities/expense';
import { InvalidParamError } from '../errors/invalid-param-error';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import { BankAccountsRepository } from '../external/ports/bank-accounts-repository';
import { ExpensesRepository } from '../external/ports/expenses-repository';
import { GeneratorIDProvider } from '../external/ports/generator-id-provider';
import { Either, left, right } from '../shared/either';

export interface ICreateExpenseDTO {
  description: string;
  spent: number;
  bankAccountId: string;
  title: string;
}

export class CreateExpenseUC {
  constructor(
    private bankAccountsRepository: BankAccountsRepository,
    private expensesRepository: ExpensesRepository,
    private generatorIDProvider: GeneratorIDProvider,
  ) {}

  async execute(
    data: Record<keyof ICreateExpenseDTO, any>,
    userID: string,
  ): Promise<
    Either<InvalidParamError | ThereIsNoEntityWithThisPropError, Expense>
  > {
    const eitherExpense = Expense.create({
      id: this.generatorIDProvider.generate(),
      description: data.description,
      bankAccountId: data.bankAccountId,
      spent: data.spent,
      createdTimestamp: Date.now(),
      title: data.title,
    });

    if (eitherExpense.isLeft()) return left(eitherExpense.value);

    const expense = eitherExpense.value;

    const existsBankAccount = await this.bankAccountsRepository.exists({
      id: expense.bankAccountId.value,
      userId: userID,
    });

    if (!existsBankAccount)
      return left(
        new ThereIsNoEntityWithThisPropError(
          'bankAccount',
          'id',
          expense.bankAccountId.value,
        ),
      );

    await this.expensesRepository.set(expense.value);

    return right(expense);
  }
}
