import { Expense } from '../entities/expense';
import { ServerError } from '../errors/server-error';
import { BankAccountsRepository } from '../external/ports/bank-accounts-repository';
import { ExpensesRepository } from '../external/ports/expenses-repository';
import { Either, left, right } from '../shared/either';

export class GetUserExpensesUC {
  constructor(
    private expensesRepository: ExpensesRepository,
    private bankAccountsRepository: BankAccountsRepository,
  ) {}

  async execute(userId: string): Promise<Either<ServerError, Expense[]>> {
    const bankAccountsObjects =
      await this.bankAccountsRepository.filterWithThisProps({ userId });

    const expensesObjects = (
      await Promise.all(
        bankAccountsObjects.map(async (bankAccountObject) => {
          return await this.expensesRepository.filterWithThisProps({
            bankAccountId: bankAccountObject.id,
          });
        }),
      )
    ).reduce((prev, curr) => prev.concat(curr), []);

    const eitherExpenses = expensesObjects.map((expenseObject) =>
      Expense.create(expenseObject),
    );

    if (eitherExpenses.some((eitherExpense) => eitherExpense.isLeft()))
      return left(new ServerError());

    const expenses = eitherExpenses.map(
      (eitherExpense) => eitherExpense.value as Expense,
    );

    return right(expenses);
  }
}
