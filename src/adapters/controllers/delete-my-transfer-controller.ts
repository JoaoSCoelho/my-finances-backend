import { ServerError } from '../../errors/server-error';
import { CalculateBankAccountAmountUC } from '../../use-cases/calculate-bank-account-amount';
import { DeleteUserTransferUC } from '../../use-cases/delete-user-transfer';
import { badRequest, ok, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class DeleteMyTransferController implements Adapter {
  constructor(
    private deleteUserTransferUC: DeleteUserTransferUC,
    private calculateBankAccountAmountUC: CalculateBankAccountAmountUC,
  ) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    const payload = httpRequest.nextData?.auth;

    if (!('userID' in payload)) return serverError(new ServerError());

    const eitherTransferObject = await this.deleteUserTransferUC.execute(
      payload.userID,
      httpRequest.params.id,
    );

    if (eitherTransferObject.isLeft())
      return badRequest(eitherTransferObject.value);

    const transferObject = eitherTransferObject.value;

    const eitherGiverBankAccountAmount =
      await this.calculateBankAccountAmountUC.execute(
        transferObject.giverBankAccountId,
      );

    if (eitherGiverBankAccountAmount.isLeft())
      return serverError(new ServerError());

    const giverBankAccountAmount = eitherGiverBankAccountAmount.value;

    const eitherReceiverBankAccountAmount =
      await this.calculateBankAccountAmountUC.execute(
        transferObject.receiverBankAccountId,
      );

    if (eitherReceiverBankAccountAmount.isLeft())
      return serverError(new ServerError());

    const receiverBankAccountAmount = eitherReceiverBankAccountAmount.value;

    return ok({
      newGiverBankAccountAmount: giverBankAccountAmount,
      newReceiverBankAccountAmount: receiverBankAccountAmount,
    });
  };
}
