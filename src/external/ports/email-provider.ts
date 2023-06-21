import nodemailer from 'nodemailer';

export type SendMethod = (
  transporter: nodemailer.Transporter,
  to: string,
  subject: string,
  text?: string,
  html?: string,
) => Promise<any>;

export type EmailProvider = {
  send: SendMethod;
};
