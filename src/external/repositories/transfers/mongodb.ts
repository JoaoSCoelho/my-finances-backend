import { Transfer } from '../../../entities/transfer';
import { ServerError } from '../../../errors/server-error';
import {
  FilterWithThisPropsMethod,
  SetMethod,
  TransfersRepository,
} from '../../ports/transfers-repository';
import { TransferModel } from './model';

export class MongoTransfers implements TransfersRepository {
  set: SetMethod = async (transfer) => {
    await TransferModel.create(transfer);

    return transfer;
  };

  filterWithThisProps: FilterWithThisPropsMethod = async (filter) => {
    const dbTransfers = await TransferModel.find(filter);

    return dbTransfers.map((dbTransfer) => {
      const eitherTransfer = Transfer.create(dbTransfer);

      if (eitherTransfer.isLeft()) throw new ServerError();

      const transfer = eitherTransfer.value;

      return transfer.value;
    });
  };
}
