import { NextFunction, Request, Response } from 'express';

import { ServerError } from '../errors/server-error';
import { Adapter } from './ports/adapter';
import { IHttpRequest } from './ports/http';

export function adaptRoute(adapter: Adapter) {
  return async (
    req: Request & IHttpRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const httpRequest: IHttpRequest = {
      body: req.body,
      query: req.query,
      params: req.params,
      headers: req.headers,
      nextData: req.nextData,
    };

    try {
      const adapterResponse = await adapter.handle(httpRequest);

      // If the adapter returns an API response

      if ('statusCode' in adapterResponse) {
        return res
          .type(adapterResponse.type || 'application/json')
          .status(adapterResponse.statusCode)
          .send(adapterResponse.body);
      }

      // If the adapter returns a handler continuation

      if (adapterResponse.nextData) {
        req.nextData = {
          ...req.nextData,
          ...adapterResponse.nextData,
        };
      }

      next(adapterResponse.err);
    } catch (error) {
      console.error(error);
      return res.status(500).json(new ServerError());
    }
  };
}
