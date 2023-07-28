import { Expense } from '../../../entities/expense';
import { ServerError } from '../../../errors/server-error';
import { left, right } from '../../../shared/either';
import {
  BulkDeleteMethod,
  DeleteMethod,
  DeletePropsMethod,
  ExpensesRepository,
  FilterWithThisPropsMethod,
  FindWithThisPropsMethod,
  SetMethod,
  UpdateMethod,
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

  findWithThisProps: FindWithThisPropsMethod = async (filter) => {
    const dbExpenseObject = await ExpenseModel.findOne(filter);

    if (!dbExpenseObject) return left(null);

    const eitherExpense = Expense.create(dbExpenseObject);

    if (eitherExpense.isLeft()) throw new ServerError('internal');

    const expense = eitherExpense.value;

    return right(expense.value);
  };

  update: UpdateMethod = async (id, updateObject) => {
    const dbExpense = await ExpenseModel.findOneAndUpdate(
      { id },
      updateObject,
      { new: true },
    );

    if (!dbExpense) return left(null);

    const eitherExpense = Expense.create(dbExpense);

    if (eitherExpense.isLeft()) throw new ServerError();

    const expense = eitherExpense.value;

    return right(expense.value);
  };

  delete: DeleteMethod = async (id) => {
    await ExpenseModel.findOneAndDelete({ id: id });
  };

  bulkDelete: BulkDeleteMethod = async (filter) => {
    await ExpenseModel.deleteMany(filter);
  };

  deleteProps: DeletePropsMethod = async (id, propsNames) => {
    const dbExpense = await ExpenseModel.findOneAndUpdate(
      { id },
      {
        $unset: propsNames.reduce(
          (prev, curr) => ({ ...prev, [curr]: '' }),
          {},
        ),
      },
      { new: true },
    );

    if (!dbExpense) return left(null);

    const eitherExpense = Expense.create(dbExpense);

    if (eitherExpense.isLeft()) throw new ServerError();

    const expense = eitherExpense.value;

    return right(expense.value);
  };
}
