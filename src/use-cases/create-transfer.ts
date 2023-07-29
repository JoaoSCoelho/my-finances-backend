import { Transfer } from '../entities/transfer';
import { ImpossibleCombinationError } from '../errors/impossible-combination-error';
import { InvalidParamError } from '../errors/invalid-param-error';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import { BankAccountsRepository } from '../external/ports/bank-accounts-repository';
import { GeneratorIDProvider } from '../external/ports/generator-id-provider';
import { TransfersRepository } from '../external/ports/transfers-repository';
import { Either, left, right } from '../shared/either';

export interface ICreateTransferDTO {
  description: string;
  amount: number;
  receiverBankAccountId: string;
  giverBankAccountId: string;
  title: string;
}

export class CreateTransferUC {
  constructor(
    private bankAccountsRepository: BankAccountsRepository,
    private transfersRepository: TransfersRepository,
    private generatorIDProvider: GeneratorIDProvider,
  ) {}

  async execute(
    data: Record<keyof ICreateTransferDTO, any>,
    userID: string,
  ): Promise<
    Either<
      | InvalidParamError
      | ThereIsNoEntityWithThisPropError
      | ImpossibleCombinationError,
      Transfer
    >
  > {
    const eitherTransfer = Transfer.create({
      id: this.generatorIDProvider.generate(),
      description: data.description,
      giverBankAccountId: data.giverBankAccountId,
      receiverBankAccountId: data.receiverBankAccountId,
      amount: data.amount,
      createdTimestamp: Date.now(),
      title: data.title,
    });

    if (eitherTransfer.isLeft()) return left(eitherTransfer.value);

    const transfer = eitherTransfer.value;

    if (data.giverBankAccountId === data.receiverBankAccountId)
      return left(
        new ImpossibleCombinationError(
          `giverBankAccountId: ${data.giverBankAccountId}`,
          `receiverBankAccountId: ${data.receiverBankAccountId}`,
        ),
      );

    const existsGiverBankAccount = await this.bankAccountsRepository.exists({
      id: transfer.giverBankAccountId.value,
      userId: userID,
    });
    const existsReceiverBankAccount = await this.bankAccountsRepository.exists({
      id: transfer.receiverBankAccountId.value,
      userId: userID,
    });

    if (!existsGiverBankAccount)
      return left(
        new ThereIsNoEntityWithThisPropError(
          'bankAccount',
          'id',
          transfer.giverBankAccountId.value,
        ),
      );
    if (!existsReceiverBankAccount)
      return left(
        new ThereIsNoEntityWithThisPropError(
          'bankAccount',
          'id',
          transfer.receiverBankAccountId.value,
        ),
      );

    await this.transfersRepository.set(transfer.value);

    return right(transfer);
  }
}
