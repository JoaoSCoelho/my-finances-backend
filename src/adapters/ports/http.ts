import { Request } from 'express';

export interface IHttpResponse {
  statusCode: number;
  body: any;
  type?: string;
}

export interface IHttpRequest {
  query: Request['query'];
  body: Request['body'];
  params: Request['params'];
  headers: Request['headers'];
  middlewareData?: Record<string, any>; // Data that is passed from middlewares to controllers
}

export interface INextResponse {
  err?: string;
  middlewareData?: IHttpRequest['middlewareData'];
}
