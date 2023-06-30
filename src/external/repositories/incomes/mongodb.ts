import { Income } from '../../../entities/income';
import { ServerError } from '../../../errors/server-error';
import {
  FilterWithThisPropsMethod,
  IncomesRepository,
  SetMethod,
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
}
