import { readFileSync } from 'fs';

import { ConfirmEmailUC } from '../../use-cases/confirm-email';
import { badRequest, ok } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class ConfirmEmailController implements Adapter {
  constructor(private confirmEmailUC: ConfirmEmailUC) {}

  handle: AdapterHandleMethod = async (httpRequest) => {
    const token = httpRequest.params.token;

    const eitherConfirmEmail = await this.confirmEmailUC.execute(token);

    if (eitherConfirmEmail.isLeft()) {
      if (
        eitherConfirmEmail.value.name === 'Invalid param' &&
        eitherConfirmEmail.value.reason === 'expired'
      )
        return badRequest(
          readFileSync(
            './src/pages/confirm-email-expired.html',
          ).toString() as unknown as Error,
          'text/html',
        );
      else return badRequest(eitherConfirmEmail.value);
    }

    return ok(
      readFileSync('./src/pages/confirm-email-success.html').toString(),
      'text/html',
    );
  };
}
