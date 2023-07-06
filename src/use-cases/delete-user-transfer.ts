import { ITransferObject } from '../entities/transfer';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import { BankAccountsRepository } from '../external/ports/bank-accounts-repository';
import { TransfersRepository } from '../external/ports/transfers-repository';
import { Either, left, right } from '../shared/either';

export class DeleteUserTransferUC {
  constructor(
    private transfersRepository: TransfersRepository,
    private bankAccountsRepository: BankAccountsRepository,
  ) {}

  async execute(
    userID: string,
    transferID: string,
  ): Promise<Either<ThereIsNoEntityWithThisPropError, ITransferObject>> {
    const eitherTransferObject =
      await this.transfersRepository.findWithThisProps({ id: transferID });

    if (eitherTransferObject.isLeft())
      return left(
        new ThereIsNoEntityWithThisPropError('transfer', 'id', transferID),
      );

    const transferObject = eitherTransferObject.value;

    const existsGiverBankAccount = await this.bankAccountsRepository.exists({
      userId: userID,
      id: transferObject.giverBankAccountId,
    });

    if (!existsGiverBankAccount)
      return left(
        new ThereIsNoEntityWithThisPropError('transfer', 'id', transferID),
      );

    const existsReceiverBankAccount = await this.bankAccountsRepository.exists({
      userId: userID,
      id: transferObject.receiverBankAccountId,
    });

    if (!existsReceiverBankAccount)
      return left(
        new ThereIsNoEntityWithThisPropError('transfer', 'id', transferID),
      );

    await this.transfersRepository.delete(transferID);

    return right(transferObject);
  }
}
