import { Expense } from '../entities/expense';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import { BankAccountsRepository } from '../external/ports/bank-accounts-repository';
import { ExpensesRepository } from '../external/ports/expenses-repository';
import { GeneratorIDProvider } from '../external/ports/generator-id-provider';
import { left, right } from '../shared/either';
import { ExecuteMethod } from './ports/create-expense';

export class CreateExpenseUC {
  constructor(
    private bankAccountsRepository: BankAccountsRepository,
    private expensesRepository: ExpensesRepository,
    private generatorIDProvider: GeneratorIDProvider,
  ) {}

  execute: ExecuteMethod = async (data) => {
    const eitherExpense = Expense.create({
      id: this.generatorIDProvider.generate(),
      description: data.description,
      bankAccountId: data.bankAccountId,
      spent: data.spent,
      createdTimestamp: Date.now(),
    });

    if (eitherExpense.isLeft()) return left(eitherExpense.value);

    const expense = eitherExpense.value;

    const existsBankAccount =
      await this.bankAccountsRepository.existsWithThisID(
        expense.bankAccountId.value,
      );

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
  };
}
