import { NoPermissionsError } from '../../errors/no-permissions-error';
import { ServerError } from '../../errors/server-error';
import { next, serverError, unauthorized } from '../helpers/http-helper';
import { Adapter, AdapterHandleMethod } from '../ports/adapter';

export class ConfirmedEmailMiddleware implements Adapter {
  handle: AdapterHandleMethod = async (httpRequest) => {
    const payload = httpRequest.nextData?.auth;

    if (!payload || !('confirmedEmail' in payload))
      return serverError(new ServerError());

    if (!payload.confirmedEmail)
      return unauthorized(new NoPermissionsError('CONFIRMED_EMAIL'));

    return next();
  };
}
