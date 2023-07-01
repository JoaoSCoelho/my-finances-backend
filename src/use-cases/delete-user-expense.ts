import { IExpenseObject } from '../entities/expense';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import { BankAccountsRepository } from '../external/ports/bank-accounts-repository';
import { ExpensesRepository } from '../external/ports/expenses-repository';
import { Either, left, right } from '../shared/either';

export class DeleteUserExpenseUC {
  constructor(
    private expensesRepository: ExpensesRepository,
    private bankAccountsRepository: BankAccountsRepository,
  ) {}

  async execute(
    userID: string,
    expenseID: string,
  ): Promise<Either<ThereIsNoEntityWithThisPropError, IExpenseObject>> {
    const eitherExpenseObject = await this.expensesRepository.findWithThisProps(
      { id: expenseID },
    );

    if (eitherExpenseObject.isLeft())
      return left(
        new ThereIsNoEntityWithThisPropError('expense', 'id', expenseID),
      );

    const expenseObject = eitherExpenseObject.value;

    const existsBankAccount = await this.bankAccountsRepository.exists({
      userId: userID,
      id: expenseObject.bankAccountId,
    });

    if (!existsBankAccount)
      return left(
        new ThereIsNoEntityWithThisPropError('expense', 'id', expenseID),
      );

    await this.expensesRepository.delete(expenseID);

    return right(expenseObject);
  }
}
