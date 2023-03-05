import { IHttpRequest, IHttpResponse } from './http';

export type ControllerHandleMethod = (
  httpRequest: IHttpRequest,
) => Promise<IHttpResponse>;

export type Controller = {
  handle: ControllerHandleMethod;
};
