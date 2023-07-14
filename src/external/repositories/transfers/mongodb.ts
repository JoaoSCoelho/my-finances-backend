import { Transfer } from '../../../entities/transfer';
import { ServerError } from '../../../errors/server-error';
import { left, right } from '../../../shared/either';
import {
  DeleteMethod,
  DeletePropsMethod,
  FilterWithThisPossibilitiesMethod,
  FilterWithThisPropsMethod,
  FindWithThisPropsMethod,
  SetMethod,
  TransfersRepository,
  UpdateMethod,
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

  filterWithThisPossibilities: FilterWithThisPossibilitiesMethod = async (
    filters,
  ) => {
    const dbTransfers = await TransferModel.find({ $or: filters });

    return dbTransfers.map((dbTransfer) => {
      const eitherTransfer = Transfer.create(dbTransfer);

      if (eitherTransfer.isLeft()) throw new ServerError();

      const transfer = eitherTransfer.value;

      return transfer.value;
    });
  };

  findWithThisProps: FindWithThisPropsMethod = async (filter) => {
    const dbTransferObject = await TransferModel.findOne(filter);

    if (!dbTransferObject) return left(null);

    const eitherTransfer = Transfer.create(dbTransferObject);

    if (eitherTransfer.isLeft()) throw new ServerError('internal');

    const transfer = eitherTransfer.value;

    return right(transfer.value);
  };

  update: UpdateMethod = async (id, updateObject) => {
    const dbTransfer = await TransferModel.findOneAndUpdate(
      { id },
      updateObject,
      {
        new: true,
      },
    );

    if (!dbTransfer) return left(null);

    const eitherTransfer = Transfer.create(dbTransfer);

    if (eitherTransfer.isLeft()) throw new ServerError();

    const transfer = eitherTransfer.value;

    return right(transfer.value);
  };

  delete: DeleteMethod = async (id) => {
    await TransferModel.findOneAndDelete({ id: id });

    return;
  };

  deleteProps: DeletePropsMethod = async (id, propsNames) => {
    const dbTransfer = await TransferModel.findOneAndUpdate(
      { id },
      {
        $unset: propsNames.reduce(
          (prev, curr) => ({ ...prev, [curr]: '' }),
          {},
        ),
      },
      { new: true },
    );

    if (!dbTransfer) return left(null);

    const eitherTransfer = Transfer.create(dbTransfer);

    if (eitherTransfer.isLeft()) throw new ServerError();

    const transfer = eitherTransfer.value;

    return right(transfer.value);
  };
}
