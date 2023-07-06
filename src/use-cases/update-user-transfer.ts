import { ITransferObject, Transfer } from '../entities/transfer';
import { InvalidParamError } from '../errors/invalid-param-error';
import { ServerError } from '../errors/server-error';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import { BankAccountsRepository } from '../external/ports/bank-accounts-repository';
import { TransfersRepository } from '../external/ports/transfers-repository';
import { AnyString } from '../object-values/any-string';
import { ID } from '../object-values/id';
import { NoNegativeAmount } from '../object-values/no-negative-amount';
import { TransactionTitle } from '../object-values/transaction-title';
import { Either, left, right } from '../shared/either';

export class UpdateUserTransferUC {
  constructor(
    private transfersRepository: TransfersRepository,
    private bankAccountsRepository: BankAccountsRepository,
  ) {}

  async execute(
    userID: string,
    transferID: string,
    data: Partial<
      Pick<
        ITransferObject,
        | 'amount'
        | 'description'
        | 'title'
        | 'giverBankAccountId'
        | 'receiverBankAccountId'
      >
    >,
  ): Promise<
    Either<
      ThereIsNoEntityWithThisPropError | InvalidParamError | ServerError,
      Transfer
    >
  > {
    const eitherTransferObject =
      await this.transfersRepository.findWithThisProps({ id: transferID });

    if (eitherTransferObject.isLeft())
      return left(
        new ThereIsNoEntityWithThisPropError('transfer', 'id', transferID),
      );

    const transferObject = eitherTransferObject.value;

    const existsGiverBankAccount = await this.bankAccountsRepository.exists({
      id: transferObject.giverBankAccountId,
      userId: userID,
    });

    if (!existsGiverBankAccount)
      return left(
        new ThereIsNoEntityWithThisPropError('transfer', 'id', transferID),
      );

    const existsReceiverBankAccount = await this.bankAccountsRepository.exists({
      id: transferObject.receiverBankAccountId,
      userId: userID,
    });

    if (!existsReceiverBankAccount)
      return left(
        new ThereIsNoEntityWithThisPropError('transfer', 'id', transferID),
      );

    const eitherAmount = NoNegativeAmount.create(data.amount);

    if ('amount' in data && eitherAmount.isLeft())
      return left(
        new InvalidParamError(
          'amount',
          data.amount,
          eitherAmount.value.reason,
          eitherAmount.value.expected,
        ),
      );

    const eitherTitle = TransactionTitle.create(data.title);

    if ('title' in data && eitherTitle.isLeft())
      return left(
        new InvalidParamError(
          'title',
          data.title,
          eitherTitle.value.reason,
          eitherTitle.value.expected,
        ),
      );

    const eitherDescription = AnyString.create(data.description);

    if ('description' in data && eitherDescription.isLeft())
      return left(
        new InvalidParamError(
          'description',
          data.description,
          eitherDescription.value.reason,
          eitherDescription.value.expected,
        ),
      );

    const eitherGiverBankAccountId = ID.create(data.giverBankAccountId);

    if ('giverBankAccountId' in data) {
      if (eitherGiverBankAccountId.isLeft())
        return left(
          new InvalidParamError(
            'giverBankAccountId',
            data.giverBankAccountId,
            eitherGiverBankAccountId.value.reason,
            eitherGiverBankAccountId.value.expected,
          ),
        );
      else {
        const existsNewBankAccount = await this.bankAccountsRepository.exists({
          id: data.giverBankAccountId,
          userId: userID,
        });

        if (!existsNewBankAccount)
          return left(
            new ThereIsNoEntityWithThisPropError(
              'bankAccount',
              'id',
              data.giverBankAccountId,
            ),
          );
      }
    }

    const eitherReceiverBankAccountId = ID.create(data.receiverBankAccountId);

    if ('receiverBankAccountId' in data) {
      if (eitherReceiverBankAccountId.isLeft())
        return left(
          new InvalidParamError(
            'receiverBankAccountId',
            data.receiverBankAccountId,
            eitherReceiverBankAccountId.value.reason,
            eitherReceiverBankAccountId.value.expected,
          ),
        );
      else {
        const existsNewBankAccount = await this.bankAccountsRepository.exists({
          id: data.receiverBankAccountId,
          userId: userID,
        });

        if (!existsNewBankAccount)
          return left(
            new ThereIsNoEntityWithThisPropError(
              'bankAccount',
              'id',
              data.receiverBankAccountId,
            ),
          );
      }
    }

    const eitherUpdatedTransferObject = await this.transfersRepository.update(
      transferID,
      data,
    );

    if (eitherUpdatedTransferObject.isLeft()) return left(new ServerError());

    const updatedTransferObject = eitherUpdatedTransferObject.value;

    const eitherTransfer = Transfer.create(updatedTransferObject);

    if (eitherTransfer.isLeft()) return left(new ServerError());

    const transfer = eitherTransfer.value;

    return right(transfer);
  }
}
