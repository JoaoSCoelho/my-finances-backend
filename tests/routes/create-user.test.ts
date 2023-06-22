import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../src/config/app';
import { UserModel } from '../../src/external/repositories/users/model';

describe('Create user endpoint', () => {
  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('should return a new user', async () => {
    const requestData = {
      username: 'nome de usuário',
      email: 'user_email2@domain.com.country',
      password: 'mysecure@password2023',
    };

    await UserModel.deleteOne({ email: requestData.email });

    const { body, status } = await supertest(app)
      .post('/api/users')
      .send(requestData);

    expect(status).toBe(201);

    expect(body).toEqual({
      user: {
        username: requestData.username,
        email: requestData.email,
        confirmedEmail: false,
        id: expect.any(String),
        createdTimestamp: expect.any(Number),
      },
      token: expect.any(String),
    });

    expect(body.user.createdTimestamp).toBeLessThanOrEqual(Date.now());
  });

  test('should return a missing username error', async () => {
    const requestData = {
      email: 'user_email2@domain.com.country',
      password: 'mysecure@password2023',
    };

    const { body, status } = await supertest(app)
      .post('/api/users')
      .send(requestData);

    expect(status).toBe(400);

    expect(body).toEqual({
      error: 'Missing param: username',
      paramName: 'username',
      code: 103,
      name: 'Missing param',
    });
  });

  test('should return a missing email error', async () => {
    const requestData = {
      username: 'nome de usuário',
      password: 'mysecure@password2023',
    };

    const { body, status } = await supertest(app)
      .post('/api/users')
      .send(requestData);

    expect(status).toBe(400);

    expect(body).toEqual({
      error: 'Missing param: email',
      paramName: 'email',
      code: 103,
      name: 'Missing param',
    });
  });

  test('should return a missing password error', async () => {
    const requestData = {
      email: 'user_email2@domain.com.country',
      username: 'nome de usuário',
    };

    const { body, status } = await supertest(app)
      .post('/api/users')
      .send(requestData);

    expect(status).toBe(400);

    expect(body).toEqual({
      error: 'Missing param: password',
      paramName: 'password',
      code: 103,
      name: 'Missing param',
    });
  });

  test('should return a invalid type username error', async () => {
    const requestData = {
      username: 546,
      email: 'user_email2@domain.com.country',
      password: 'mysecure@password2023',
    };

    const { body, status } = await supertest(app)
      .post('/api/users')
      .send(requestData);

    expect(status).toBe(400);

    expect(body).toEqual({
      error:
        'The username "546" is invalid: type not supported. Expected: string',
      name: 'Invalid param',
      code: 100,
      paramName: 'username',
      param: 546,
      reason: 'type not supported',
      expected: 'string',
    });
  });

  test('should return a invalid type email error', async () => {
    const requestData = {
      username: '546',
      email: false,
      password: 'mysecure@password2023',
    };

    const { body, status } = await supertest(app)
      .post('/api/users')
      .send(requestData);

    expect(status).toBe(400);

    expect(body).toEqual({
      error:
        'The email "false" is invalid: type not supported. Expected: string',
      name: 'Invalid param',
      code: 100,
      paramName: 'email',
      param: false,
      reason: 'type not supported',
      expected: 'string',
    });
  });

  test('should return a invalid type password error', async () => {
    const requestData = {
      username: '546',
      email: 'user_email2@domain.com.country',
      password: { pass: 'mysecure@password2023' },
    };

    const { body, status } = await supertest(app)
      .post('/api/users')
      .send(requestData);

    expect(status).toBe(400);

    expect(body).toEqual({
      error:
        'The password "[object Object]" is invalid: type not supported. Expected: string',
      name: 'Invalid param',
      code: 100,
      paramName: 'password',
      param: { pass: 'mysecure@password2023' },
      reason: 'type not supported',
      expected: 'string',
    });
  });

  test('should return a invalid username error by min length', async () => {
    const requestData = {
      username: '12',
      email: 'user_email2@domain.com.country',
      password: 'mysecure@password2023',
    };

    const { body, status } = await supertest(app)
      .post('/api/users')
      .send(requestData);

    expect(status).toBe(400);

    expect(body).toEqual({
      error:
        'The username "12" is invalid: less than the minimum characters. Expected: More or equal than 3 characters',
      name: 'Invalid param',
      code: 100,
      paramName: 'username',
      param: '12',
      reason: 'less than the minimum characters',
      expected: 'More or equal than 3 characters',
    });
  });

  test('should return a invalid username error by max length', async () => {
    const requestData = {
      username: 'a'.repeat(31),
      email: 'user_email2@domain.com.country',
      password: 'mysecure@password2023',
    };

    const { body, status } = await supertest(app)
      .post('/api/users')
      .send(requestData);

    expect(status).toBe(400);

    expect(body).toEqual({
      error: `The username "${requestData.username}" is invalid: greater than the maximum characters. Expected: Less or equal than 30 characters`,
      name: 'Invalid param',
      code: 100,
      paramName: 'username',
      param: requestData.username,
      reason: 'greater than the maximum characters',
      expected: 'Less or equal than 30 characters',
    });
  });
});
