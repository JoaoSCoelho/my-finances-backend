import { IHttpResponse, INextResponse } from '../ports/http';

export const next = (nextObject?: INextResponse): INextResponse =>
  nextObject || {};

export const ok = <Body = IHttpResponse['body']>(
  body?: Body,
  type?: IHttpResponse['type'],
): IHttpResponse => ({
  statusCode: 200,
  body,
  type,
});

export const created = <Body = IHttpResponse['body']>(
  body: Body,
): IHttpResponse => ({
  statusCode: 201,
  body,
});

export const badRequest = (error: Error): IHttpResponse => ({
  statusCode: 400,
  body: error,
});

export const unauthorized = (error: Error): IHttpResponse => ({
  statusCode: 401,
  body: error,
});

export const serverError = (error: Error): IHttpResponse => ({
  statusCode: 500,
  body: error,
});
