import { InvalidParamError } from '../../errors/invalid-param-error';
import { ServerError } from '../../errors/server-error';
import { AnyObject } from '../../object-values/any-object';
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

    const eitherBody = AnyObject.create(httpRequest.body);

    if (eitherBody.isLeft()) {
      const {
        value: { reason, expected },
      } = eitherBody;

      return badRequest(
        new InvalidParamError('body', httpRequest.body, reason, expected),
      );
    }

    const { value: body } = eitherBody.value;

    const eitherIncome = await this.createIncomeUC.execute(
      {
        bankAccountId: body.bankAccountId,
        description: body.description,
        gain: body.gain,
        title: body.title,
      },
      payload.userID,
    );

    if (eitherIncome.isLeft()) return badRequest(eitherIncome.value);

    const income = eitherIncome.value;

    const eitherBankAccountAmount =
      await this.calculateBankAccountAmountUC.execute(body.bankAccountId);

    if (eitherBankAccountAmount.isLeft()) return serverError(new ServerError());

    const bankAccountAmount = eitherBankAccountAmount.value;

    return created({
      income: income.value,
      newBankAccountAmount: bankAccountAmount,
    });
  };
}
