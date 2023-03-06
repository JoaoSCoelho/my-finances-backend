import { IHttpRequest, IHttpResponse, INextResponse } from './http';

export type AdapterHandleMethod = (
  httpRequest: IHttpRequest,
) => Promise<IHttpResponse | INextResponse>;

export type Adapter = {
  handle: AdapterHandleMethod;
};
