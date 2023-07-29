import { ServerError } from '../../errors/server-error';
import { ID } from '../../object-values/id';
import { CalculateBankAccountAmountUC } from '../../use-cases/calculate-bank-account-amount';
import { UpdateUserBankAccountUC } from '../../use-cases/update-user-bank-account';
import { badRequest, ok, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class UpdateMyBankAccountController implements Adapter {
  constructor(
    private updateUserBankAccountUC: UpdateUserBankAccountUC,
    private calculateBankAccountAmountUC: CalculateBankAccountAmountUC,
  ) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    const eitherId = ID.create(httpRequest.params.id);

    if (eitherId.isLeft()) return badRequest(eitherId.value);

    const { value: id } = eitherId.value;

    const payload = httpRequest.nextData?.auth;

    if (!payload || !('userID' in payload))
      return serverError(new ServerError());

    const eitherBankAccount = await this.updateUserBankAccountUC.execute(
      id,
      payload.userID,
      {
        initialAmount: httpRequest.body.initialAmount,
        imageURL: httpRequest.body.imageURL,
        name: httpRequest.body.name,
      },
    );

    if (eitherBankAccount.isLeft()) {
      if (eitherBankAccount.value.name === 'Server error')
        return serverError(eitherBankAccount.value);
      return badRequest(eitherBankAccount.value);
    }

    const bankAccount = eitherBankAccount.value;

    const bankAccountAmount = (
      await this.calculateBankAccountAmountUC.execute(bankAccount.id.value)
    ).value as number;

    return ok({
      bankAccount: { ...bankAccount.value, totalAmount: bankAccountAmount },
    });
  };
}
