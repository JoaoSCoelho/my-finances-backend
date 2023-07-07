import { MissingParamError } from '../../errors/missing-param-error';
import { ServerError } from '../../errors/server-error';
import { CalculateBankAccountAmountUC } from '../../use-cases/calculate-bank-account-amount';
import { CreateTransferUC } from '../../use-cases/create-transfer';
import { badRequest, created, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class CreateTransferController implements Adapter {
  constructor(
    private createTransferUC: CreateTransferUC,
    private calculateBankAccountAmountUC: CalculateBankAccountAmountUC,
  ) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    const payload = httpRequest.nextData?.auth;

    if (!('userID' in payload)) return serverError(new ServerError());

    if (!('title' in httpRequest.body))
      return badRequest(new MissingParamError('title'));
    if (!('amount' in httpRequest.body))
      return badRequest(new MissingParamError('amount'));
    if (!('giverBankAccountId' in httpRequest.body))
      return badRequest(new MissingParamError('giverBankAccountId'));
    if (!('receiverBankAccountId' in httpRequest.body))
      return badRequest(new MissingParamError('receiverBankAccountId'));

    const eitherTransfer = await this.createTransferUC.execute(
      {
        giverBankAccountId: httpRequest.body.giverBankAccountId,
        receiverBankAccountId: httpRequest.body.receiverBankAccountId,
        description: httpRequest.body.description,
        amount: httpRequest.body.amount,
        title: httpRequest.body.title,
      },
      payload.userID,
    );

    if (eitherTransfer.isLeft()) return badRequest(eitherTransfer.value);

    const transfer = eitherTransfer.value;

    const eitherGiverBankAccountAmount =
      await this.calculateBankAccountAmountUC.execute(
        httpRequest.body.giverBankAccountId,
      );

    if (eitherGiverBankAccountAmount.isLeft())
      return serverError(new ServerError());

    const giverBankAccountAmount = eitherGiverBankAccountAmount.value;

    const eitherReceiverBankAccountAmount =
      await this.calculateBankAccountAmountUC.execute(
        httpRequest.body.receiverBankAccountId,
      );

    if (eitherReceiverBankAccountAmount.isLeft())
      return serverError(new ServerError());

    const receiverBankAccountAmount = eitherReceiverBankAccountAmount.value;

    return created({
      transfer: transfer.value,
      newGiverBankAccountAmount: giverBankAccountAmount,
      newReceiverBankAccountAmount: receiverBankAccountAmount,
    });
  };
}
