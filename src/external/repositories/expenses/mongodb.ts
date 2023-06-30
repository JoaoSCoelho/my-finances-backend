import { Expense } from '../../../entities/expense';
import { ServerError } from '../../../errors/server-error';
import {
  ExpensesRepository,
  FilterWithThisPropsMethod,
  SetMethod,
} from '../../ports/expenses-repository';
import { ExpenseModel } from './model';

export class MongoExpenses implements ExpensesRepository {
  set: SetMethod = async (expense) => {
    await ExpenseModel.create(expense);

    return expense;
  };

  filterWithThisProps: FilterWithThisPropsMethod = async (filter) => {
    const dbExpenses = await ExpenseModel.find(filter);

    return dbExpenses.map((dbExpense) => {
      const eitherExpense = Expense.create(dbExpense);

      if (eitherExpense.isLeft()) throw new ServerError();

      const expense = eitherExpense.value;

      return expense.value;
    });
  };
}
