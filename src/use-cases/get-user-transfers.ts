import { Transfer } from '../entities/transfer';
import { ServerError } from '../errors/server-error';
import { BankAccountsRepository } from '../external/ports/bank-accounts-repository';
import { TransfersRepository } from '../external/ports/transfers-repository';
import { Either, left, right } from '../shared/either';

export class GetUserTransfersUC {
  constructor(
    private transfersRepository: TransfersRepository,
    private bankAccountsRepository: BankAccountsRepository,
  ) {}

  async execute(userId: string): Promise<Either<ServerError, Transfer[]>> {
    const bankAccountsObjects =
      await this.bankAccountsRepository.filterWithThisProps({ userId });

    const transfersObjects = (
      await Promise.all(
        bankAccountsObjects.map(async (bankAccountObject) => {
          return await this.transfersRepository.filterWithThisPossibilities([
            { giverBankAccountId: bankAccountObject.id },
            { receiverBankAccountId: bankAccountObject.id },
          ]);
        }),
      )
    )
      .reduce((prev, curr) => prev.concat(curr), [])
      .filter(
        (transferObject, i, arr) =>
          arr.findIndex((to) => to.id === transferObject.id) === i,
      );

    const eitherTransfers = transfersObjects.map((transferObject) =>
      Transfer.create(transferObject),
    );

    if (eitherTransfers.some((eitherTransfer) => eitherTransfer.isLeft()))
      return left(new ServerError());

    const transfers = eitherTransfers.map(
      (eitherTransfer) => eitherTransfer.value as Transfer,
    );

    return right(transfers);
  }
}
