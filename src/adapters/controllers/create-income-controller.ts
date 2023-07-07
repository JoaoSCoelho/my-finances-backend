import { MissingParamError } from '../../errors/missing-param-error';
import { ServerError } from '../../errors/server-error';
import { CalculateBankAccountAmountUC } from '../../use-cases/calculate-bank-account-amount';
import { CreateIncomeUC } from '../../use-cases/create-income';
import { badRequest, created, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class CreateIncomeController implements Adapter {
  constructor(
    private createIncomeUC: CreateIncomeUC,
    private calculateBankAccountAmountUC: CalculateBankAccountAmountUC,
  ) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    const payload = httpRequest.nextData?.auth;

    if (!('userID' in payload)) return serverError(new ServerError());

    if (!('title' in httpRequest.body))
      return badRequest(new MissingParamError('title'));
    if (!('gain' in httpRequest.body))
      return badRequest(new MissingParamError('gain'));
    if (!('bankAccountId' in httpRequest.body))
      return badRequest(new MissingParamError('bankAccountId'));

    const eitherIncome = await this.createIncomeUC.execute(
      {
        bankAccountId: httpRequest.body.bankAccountId,
        description: httpRequest.body.description,
        gain: httpRequest.body.gain,
        title: httpRequest.body.title,
      },
      payload.userID,
    );

    if (eitherIncome.isLeft()) return badRequest(eitherIncome.value);

    const income = eitherIncome.value;

    const eitherBankAccountAmount =
      await this.calculateBankAccountAmountUC.execute(
        httpRequest.body.bankAccountId,
      );

    if (eitherBankAccountAmount.isLeft()) return serverError(new ServerError());

    const bankAccountAmount = eitherBankAccountAmount.value;

    return created({
      income: income.value,
      newBankAccountAmount: bankAccountAmount,
    });
  };
}
