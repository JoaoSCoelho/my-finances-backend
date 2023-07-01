import { InvalidParamError } from '../../errors/invalid-param-error';
import { ServerError } from '../../errors/server-error';
import { AnyObject } from '../../object-values/any-object';
import { CalculateBankAccountAmountUC } from '../../use-cases/calculate-bank-account-amount';
import { UpdateUserIncomeUC } from '../../use-cases/update-user-income';
import { badRequest, ok, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class UpdateMyIncomeController implements Adapter {
  constructor(
    private updateUserIncomeUC: UpdateUserIncomeUC,
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

    const eitherUpdateIncome = await this.updateUserIncomeUC.execute(
      payload.userID,
      httpRequest.params.id,
      {
        description: body.description,
        title: body.title,
        gain: body.gain,
      },
    );

    if (eitherUpdateIncome.isLeft()) {
      if (eitherUpdateIncome.value.name === 'Server error')
        return serverError(eitherUpdateIncome.value);
      else return badRequest(eitherUpdateIncome.value);
    }

    const updatedIncome = eitherUpdateIncome.value;

    const eitherBankAccountAmount =
      await this.calculateBankAccountAmountUC.execute(
        updatedIncome.bankAccountId.value,
      );

    if (eitherBankAccountAmount.isLeft()) return serverError(new ServerError());

    const bankAccountAmount = eitherBankAccountAmount.value;

    return ok({
      updatedIncome: updatedIncome.value,
      newBankAccountAmount: bankAccountAmount,
    });
  };
}
