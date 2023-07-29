import { Expense, IExpenseObject } from '../entities/expense';
import { InvalidParamError } from '../errors/invalid-param-error';
import { ServerError } from '../errors/server-error';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import { BankAccountsRepository } from '../external/ports/bank-accounts-repository';
import { ExpensesRepository } from '../external/ports/expenses-repository';
import { AnyString } from '../object-values/any-string';
import { ID } from '../object-values/id';
import { NoNegativeAmount } from '../object-values/no-negative-amount';
import { TransactionTitle } from '../object-values/transaction-title';
import { Either, left, right } from '../shared/either';

export class UpdateUserExpenseUC {
  constructor(
    private expensesRepository: ExpensesRepository,
    private bankAccountsRepository: BankAccountsRepository,
  ) {}

  async execute(
    userID: string,
    expenseID: string,
    data: Partial<
      Pick<
        Record<keyof IExpenseObject, any>,
        'spent' | 'description' | 'title' | 'bankAccountId'
      >
    >,
  ): Promise<
    Either<
      ThereIsNoEntityWithThisPropError | InvalidParamError | ServerError,
      Expense
    >
  > {
    const eitherSpent = NoNegativeAmount.create(data.spent);

    if (data.spent !== undefined && eitherSpent.isLeft())
      return left(
        new InvalidParamError(
          'spent',
          data.spent,
          eitherSpent.value.reason,
          eitherSpent.value.expected,
        ),
      );

    const eitherTitle = TransactionTitle.create(data.title);

    if (data.title !== undefined && eitherTitle.isLeft())
      return left(
        new InvalidParamError(
          'title',
          data.title,
          eitherTitle.value.reason,
          eitherTitle.value.expected,
        ),
      );

    const eitherDescription = AnyString.create(data.description);

    if (data.description != undefined && eitherDescription.isLeft())
      return left(
        new InvalidParamError(
          'description',
          data.description,
          eitherDescription.value.reason,
          eitherDescription.value.expected,
        ),
      );

    const eitherBankAccountId = ID.create(data.bankAccountId);

    if (data.bankAccountId !== undefined) {
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

    const eitherExpenseObject = await this.expensesRepository.findWithThisProps(
      { id: expenseID },
    );

    if (eitherExpenseObject.isLeft())
      return left(
        new ThereIsNoEntityWithThisPropError('expense', 'id', expenseID),
      );

    const expenseObject = eitherExpenseObject.value;

    const existsBankAccount = await this.bankAccountsRepository.exists({
      id: expenseObject.bankAccountId,
      userId: userID,
    });

    if (!existsBankAccount)
      return left(
        new ThereIsNoEntityWithThisPropError('expense', 'id', expenseID),
      );

    const eitherUpdatedExpenseObject = await this.expensesRepository.update(
      expenseID,
      data,
    );

    if (eitherUpdatedExpenseObject.isLeft()) return left(new ServerError());

    let updatedExpenseObject = eitherUpdatedExpenseObject.value;

    if (data.description === null) {
      const eitherRemovedPropExpenseObject =
        await this.expensesRepository.deleteProps(expenseID, ['description']);

      if (eitherRemovedPropExpenseObject.isLeft())
        return left(
          new ThereIsNoEntityWithThisPropError('expense', 'id', expenseID),
        );

      updatedExpenseObject = eitherRemovedPropExpenseObject.value;
    }

    const eitherExpense = Expense.create(updatedExpenseObject);

    if (eitherExpense.isLeft()) return left(new ServerError());

    const expense = eitherExpense.value;

    return right(expense);
  }
}
