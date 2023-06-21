import { ResendEmailConfirmationController } from '../adapters/controllers/resend-email-confirmation-controller';
import { Nodemailer } from '../external/email-provider/nodemailer';
import { MongoUsers } from '../external/repositories/users/mongodb';
import { Jwt } from '../external/token-manager/jwt';
import { GetUserUC } from '../use-cases/get-user';
import { SendEmailConfirmationUC } from '../use-cases/send-email-confirmation';

export function makeResendEmailConfirmation() {
  const emailProvider = new Nodemailer();
  const tokenManager = new Jwt();
  const sendEmailConfirmationUC = new SendEmailConfirmationUC(
    emailProvider,
    tokenManager,
  );
  const usersRepository = new MongoUsers();
  const getUserUC = new GetUserUC(usersRepository);
  const resendEmailConfirmationController =
    new ResendEmailConfirmationController(sendEmailConfirmationUC, getUserUC);

  return resendEmailConfirmationController;
}
