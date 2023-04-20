import { ExpensesRepository, SetMethod } from '../../ports/expenses-repository';
import { ExpenseModel } from './model';

export class MongoExpenses implements ExpensesRepository {
  set: SetMethod = async (expense) => {
    await ExpenseModel.create(expense);

    return expense;
  };
}
