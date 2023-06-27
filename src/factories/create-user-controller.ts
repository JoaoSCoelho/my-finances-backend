import { CreateUserController } from '../adapters/controllers/create-user-controller';
import { Nodemailer } from '../external/email-provider/nodemailer';
import { Bcrypt } from '../external/encryptor-providers/bcrypt';
import { Moment } from '../external/generator-id-providers/moment';
import { MongoUsers } from '../external/repositories/users/mongodb';
import { Jwt } from '../external/token-manager/jwt';
import { CreateAccessTokenUC } from '../use-cases/create-access-token';
import { CreateRefreshTokenUC } from '../use-cases/create-refresh-token';
import { CreateUserUC } from '../use-cases/create-user';
import { SendEmailConfirmationUC } from '../use-cases/send-email-confirmation';

export function makeCreateUserController(): CreateUserController {
  const encryptor = new Bcrypt();
  const generatorID = new Moment();
  const usersRepository = new MongoUsers();
  const emailProvider = new Nodemailer();
  const createUserUC = new CreateUserUC(
    encryptor,
    generatorID,
    usersRepository,
  );
  const tokenManager = new Jwt();
  const createAccessTokenUC = new CreateAccessTokenUC(tokenManager);
  const sendEmailConfirmationUC = new SendEmailConfirmationUC(
    emailProvider,
    tokenManager,
  );
  const createRefreshTokenUC = new CreateRefreshTokenUC(
    tokenManager,
    usersRepository,
  );
  const createUserController = new CreateUserController(
    createUserUC,
    createAccessTokenUC,
    sendEmailConfirmationUC,
    createRefreshTokenUC,
  );

  return createUserController;
}
