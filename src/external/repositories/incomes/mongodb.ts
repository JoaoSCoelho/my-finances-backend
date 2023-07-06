import { Income } from '../../../entities/income';
import { ServerError } from '../../../errors/server-error';
import { left, right } from '../../../shared/either';
import {
  DeleteMethod,
  FilterWithThisPropsMethod,
  FindWithThisPropsMethod,
  IncomesRepository,
  SetMethod,
  UpdateMethod,
} from '../../ports/incomes-repository';
import { IncomeModel } from './model';

export class MongoIncomes implements IncomesRepository {
  set: SetMethod = async (income) => {
    await IncomeModel.create(income);

    return income;
  };

  filterWithThisProps: FilterWithThisPropsMethod = async (filter) => {
    const dbIncomes = await IncomeModel.find(filter);

    return dbIncomes.map((dbIncome) => {
      const eitherIncome = Income.create(dbIncome);

      if (eitherIncome.isLeft()) throw new ServerError();

      const income = eitherIncome.value;

      return income.value;
    });
  };

  findWithThisProps: FindWithThisPropsMethod = async (filter) => {
    const dbIncomeObject = await IncomeModel.findOne(filter);

    if (!dbIncomeObject) return left(null);

    const eitherIncome = Income.create(dbIncomeObject);

    if (eitherIncome.isLeft()) throw new ServerError('internal');

    const income = eitherIncome.value;

    return right(income.value);
  };

  update: UpdateMethod = async (id, updateObject) => {
    const dbIncome = await IncomeModel.findOneAndUpdate({ id }, updateObject, {
      new: true,
    });

    if (!dbIncome) return left(null);

    const eitherIncome = Income.create(dbIncome);

    if (eitherIncome.isLeft()) throw new ServerError();

    const income = eitherIncome.value;

    return right(income.value);
  };

  delete: DeleteMethod = async (id) => {
    await IncomeModel.findOneAndDelete({ id: id });

    return;
  };
}
