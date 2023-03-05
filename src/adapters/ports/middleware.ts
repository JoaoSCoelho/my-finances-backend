import { IHttpRequest, IHttpResponse, INextResponse } from './http';

export type MiddlewareHandleMethod = (
  httpRequest: IHttpRequest,
) => Promise<IHttpResponse | INextResponse>;

export type Middleware = {
  handle: MiddlewareHandleMethod;
};
