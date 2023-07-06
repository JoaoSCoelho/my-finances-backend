import { ServerError } from '../../errors/server-error';
import { GetUserTransfersUC } from '../../use-cases/get-user-transfers';
import { ok, serverError } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class GetMyTransfersController implements Adapter {
  constructor(private getUserTransfersUC: GetUserTransfersUC) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    const payload = httpRequest.nextData?.auth;

    if (!('userID' in payload)) return serverError(new ServerError());

    const eitherTransfers = await this.getUserTransfersUC.execute(
      payload.userID,
    );

    if (eitherTransfers.isLeft()) return serverError(eitherTransfers.value);

    const transfers = eitherTransfers.value;

    return ok({
      transfers: transfers.map((transfer) => transfer.value),
    });
  };
}
