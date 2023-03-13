import { InvalidParamError } from '../../errors/invalid-param-error';
import { AnyObject } from '../../object-values/any-object';
import { CreateBankAccountUC } from '../../use-cases/create-bank-account';
import { badRequest, created } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class CreateBankAccountController implements Adapter {
  constructor(private createBankAccountUC: CreateBankAccountUC) {}

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

    const eitherBankAccount = await this.createBankAccountUC.execute({
      name: body.name,
      amount: body.amount,
      userId: httpRequest.nextData?.auth.userID,
      imageURL: body.imageURL,
    });

    if (eitherBankAccount.isLeft()) return badRequest(eitherBankAccount.value);

    const bankAccount = eitherBankAccount.value;

    return created({
      bankAccount: bankAccount.value,
    });
  };
}
