import { InvalidParamError } from '../../errors/invalid-param-error';
import { ServerError } from '../../errors/server-error';
import { AnyObject } from '../../object-values/any-object';
import { CalculateBankAccountAmountUC } from '../../use-cases/calculate-bank-account-amount';
import { UpdateUserTransferUC } from '../../use-cases/update-user-transfer';
import { badRequest, ok, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class UpdateMyTransferController implements Adapter {
  constructor(
    private updateUserTransferUC: UpdateUserTransferUC,
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

    const eitherUpdateTransfer = await this.updateUserTransferUC.execute(
      payload.userID,
      httpRequest.params.id,
      {
        description: body.description,
        title: body.title,
        amount: body.spent,
        giverBankAccountId: body.giverBankAccountId,
        receiverBankAccountId: body.receiverBankAccountId,
      },
    );

    if (eitherUpdateTransfer.isLeft()) {
      if (eitherUpdateTransfer.value.name === 'Server error')
        return serverError(eitherUpdateTransfer.value);
      else return badRequest(eitherUpdateTransfer.value);
    }

    const updatedTransfer = eitherUpdateTransfer.value;

    const eitherGiverBankAccountAmount =
      await this.calculateBankAccountAmountUC.execute(
        updatedTransfer.giverBankAccountId.value,
      );

    if (eitherGiverBankAccountAmount.isLeft())
      return serverError(new ServerError());

    const giverBankAccountAmount = eitherGiverBankAccountAmount.value;

    const eitherReceiverBankAccountAmount =
      await this.calculateBankAccountAmountUC.execute(
        updatedTransfer.receiverBankAccountId.value,
      );

    if (eitherReceiverBankAccountAmount.isLeft())
      return serverError(new ServerError());

    const receiverBankAccountAmount = eitherReceiverBankAccountAmount.value;

    return ok({
      updatedTransfer: updatedTransfer.value,
      newGiverBankAccountAmount: giverBankAccountAmount,
      newReceiverBankAccountAmount: receiverBankAccountAmount,
    });
  };
}
