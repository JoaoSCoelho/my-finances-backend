import { InvalidParamError } from '../../errors/invalid-param-error';
import { AnyObject } from '../../object-values/any-object';
import { ID } from '../../object-values/id';
import { UpdateUserBankAccountUC } from '../../use-cases/update-user-bank-account';
import { badRequest, ok, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class UpdateUserBankAccountController implements Adapter {
  constructor(private updateUserBankAccountUC: UpdateUserBankAccountUC) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
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

    const eitherId = ID.create(httpRequest.params.id);

    if (eitherId.isLeft()) return badRequest(eitherId.value);

    const { value: id } = eitherId.value;

    const userID: string = httpRequest.nextData!.auth.userID;

    const eitherBankAccount = await this.updateUserBankAccountUC.execute(
      id,
      userID,
      {
        amount: body.amount,
        imageURL: body.imageURL,
        name: body.name,
      },
    );

    if (eitherBankAccount.isLeft()) {
      if (eitherBankAccount.value.name === 'Server error')
        return serverError(eitherBankAccount.value);
      return badRequest(eitherBankAccount.value);
    }

    const bankAccount = eitherBankAccount.value;

    return ok({
      bankAccount: bankAccount.value,
    });
  };
}
