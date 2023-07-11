import { ITransferObject, Transfer } from '../entities/transfer';
import { ImpossibleCombinationError } from '../errors/impossible-combination-error';
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
        Record<keyof ITransferObject, any>,
        | 'amount'
        | 'description'
        | 'title'
        | 'giverBankAccountId'
        | 'receiverBankAccountId'
      >
    >,
  ): Promise<
    Either<
      | ThereIsNoEntityWithThisPropError
      | InvalidParamError
      | ServerError
      | ImpossibleCombinationError,
      Transfer
    >
  > {
    const eitherAmount = NoNegativeAmount.create(data.amount);

    if (data.amount !== undefined && eitherAmount.isLeft())
      return left(
        new InvalidParamError(
          'amount',
          data.amount,
          eitherAmount.value.reason,
          eitherAmount.value.expected,
        ),
      );

    const eitherTitle = TransactionTitle.create(data.title);

    if (data.title !== undefined && eitherTitle.isLeft())
      return left(
        new InvalidParamError(
          'title',
          data.title,
          eitherTitle.value.reason,
          eitherTitle.value.expected,
        ),
      );

    const eitherDescription = AnyString.create(data.description);

    if (data.description != undefined && eitherDescription.isLeft())
      return left(
        new InvalidParamError(
          'description',
          data.description,
          eitherDescription.value.reason,
          eitherDescription.value.expected,
        ),
      );

    if (
      data.giverBankAccountId &&
      data.receiverBankAccountId &&
      data.giverBankAccountId === data.receiverBankAccountId
    )
      return left(
        new ImpossibleCombinationError(
          `giverBankAccountId: ${data.giverBankAccountId}`,
          `receiverBankAccountId: ${data.receiverBankAccountId}`,
        ),
      );

    const eitherGiverBankAccountId = ID.create(data.giverBankAccountId);

    if (data.giverBankAccountId !== undefined) {
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

    if (data.receiverBankAccountId !== undefined) {
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

    const eitherTransferObject =
      await this.transfersRepository.findWithThisProps({ id: transferID });

    if (eitherTransferObject.isLeft())
      return left(
        new ThereIsNoEntityWithThisPropError('transfer', 'id', transferID),
      );

    const transferObject = eitherTransferObject.value;

    if (data.giverBankAccountId === transferObject.receiverBankAccountId)
      return left(
        new ImpossibleCombinationError(
          `giverBankAccountId: ${data.giverBankAccountId}`,
          `receiverBankAccountId: ${transferObject.receiverBankAccountId}`,
        ),
      );

    if (data.receiverBankAccountId === transferObject.giverBankAccountId)
      return left(
        new ImpossibleCombinationError(
          `giverBankAccountId: ${transferObject.giverBankAccountId}`,
          `receiverBankAccountId: ${data.receiverBankAccountId}`,
        ),
      );

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

    const eitherUpdatedTransferObject = await this.transfersRepository.update(
      transferID,
      {
        ...data,
        description:
          data.description == undefined ? undefined : data.description,
      },
    );

    if (eitherUpdatedTransferObject.isLeft())
      return left(
        new ThereIsNoEntityWithThisPropError('transfer', 'id', transferID),
      );

    let updatedTransferObject = eitherUpdatedTransferObject.value;

    if (data.description === null) {
      const eitherRemovedPropTransferObject =
        await this.transfersRepository.deleteProps(transferID, ['description']);

      if (eitherRemovedPropTransferObject.isLeft())
        return left(
          new ThereIsNoEntityWithThisPropError('transfer', 'id', transferID),
        );

      updatedTransferObject = eitherRemovedPropTransferObject.value;
    }

    const eitherTransfer = Transfer.create(updatedTransferObject);

    if (eitherTransfer.isLeft()) return left(new ServerError());

    const transfer = eitherTransfer.value;

    return right(transfer);
  }
}
