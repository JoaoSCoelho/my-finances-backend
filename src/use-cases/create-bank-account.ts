import { BankAccount } from '../entities/bank-account';
import { InvalidParamError } from '../errors/invalid-param-error';
import { ThereIsNoEntityWithThisPropError } from '../errors/there-is-no-entity-with-this-prop-error';
import { BankAccountsRepository } from '../external/ports/bank-accounts-repository';
import { GeneratorIDProvider } from '../external/ports/generator-id-provider';
import { UsersRepository } from '../external/ports/users-repository';
import { Either, left, right } from '../shared/either';

export interface ICreateBankAccountDTO {
  name: string;
  initialAmount: number;
  userId: string;
  imageURL?: string;
}

export class CreateBankAccountUC {
  constructor(
    private bankAccountsRepository: BankAccountsRepository,
    private usersRepository: UsersRepository,
    private generatorIDProvider: GeneratorIDProvider,
  ) {}

  async execute(
    data: Record<keyof ICreateBankAccountDTO, any>,
  ): Promise<
    Either<InvalidParamError | ThereIsNoEntityWithThisPropError, BankAccount>
  > {
    const eitherBankAccount = BankAccount.create({
      id: this.generatorIDProvider.generate(),
      userId: data.userId,
      name: data.name,
      initialAmount: data.initialAmount,
      imageURL: data.imageURL,
      createdTimestamp: Date.now(),
    });

    if (eitherBankAccount.isLeft()) return left(eitherBankAccount.value);

    const bankAccount = eitherBankAccount.value;

    const existsUser = await this.usersRepository.existsWithThisID(
      bankAccount.userId.value,
    );

    if (!existsUser)
      return left(
        new ThereIsNoEntityWithThisPropError(
          'user',
          'id',
          bankAccount.userId.value,
        ),
      );

    await this.bankAccountsRepository.set(bankAccount.value);

    return right(bankAccount);
  }
}
