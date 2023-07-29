import { ServerError } from '../../errors/server-error';
import { ID } from '../../object-values/id';
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

    const eitherId = ID.create(httpRequest.params.id);

    if (eitherId.isLeft()) return badRequest(eitherId.value);

    const { value: id } = eitherId.value;

    const eitherUpdateIncome = await this.updateUserIncomeUC.execute(
      payload.userID,
      id,
      {
        description: httpRequest.body.description,
        title: httpRequest.body.title,
        gain: httpRequest.body.gain,
        bankAccountId: httpRequest.body.bankAccountId,
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
