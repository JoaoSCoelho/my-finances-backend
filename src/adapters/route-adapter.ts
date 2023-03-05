import { NextFunction, Request, Response } from 'express';

import { ServerError } from '../errors/server-error';
import { Controller } from './ports/controller';
import { IHttpRequest } from './ports/http';
import { Middleware } from './ports/middleware';

export function adaptRoute(adapter: Controller | Middleware) {
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
      middlewareData: req.middlewareData,
    };

    try {
      const adapterResponse = await adapter.handle(httpRequest);

      // If the adapter is a controller

      if ('statusCode' in adapterResponse) {
        return res
          .type(adapterResponse.type || 'application/json')
          .status(adapterResponse.statusCode)
          .send(adapterResponse.body);
      }

      // If the adapter is a middleware

      if (adapterResponse.middlewareData) {
        req.middlewareData = {
          ...req.middlewareData,
          ...adapterResponse.middlewareData,
        };
      }

      next(adapterResponse.err);
    } catch (error) {
      console.error(error);
      return res.status(500).json(new ServerError());
    }
  };
}
