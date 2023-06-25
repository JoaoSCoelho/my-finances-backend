import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../src/config/app';
import { apiEnv } from '../../src/config/env';
import { UserModel } from '../../src/external/repositories/users/model';
import { Jwt } from '../../src/external/token-manager/jwt';

describe('Rota de criação de usuário', () => {
  beforeAll(async () => {
    await UserModel.deleteMany();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('Deve criar um usuário no banco e retorná-lo com um token de acesso e um refresh token', async () => {
    const requestData = {
      username: 'nome de usuário',
      email: 'user_email2@domain.com.country',
      password: 'mysecure@password2023',
    };

    const { body, status } = await supertest(app)
      .post('/api/users')
      .send(requestData);

    expect(body).toEqual({
      user: {
        username: requestData.username,
        email: requestData.email,
        confirmedEmail: false,
        id: expect.any(String),
        createdTimestamp: expect.any(Number),
      },
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });

    expect(status).toBe(201);

    const jwt = new Jwt();

    expect(body.user.createdTimestamp).toBeLessThanOrEqual(Date.now());
    expect(jwt.verify(body.accessToken, apiEnv.JWT_SECRET)).toMatchObject({
      type: 'access',
      userID: body.user.id,
      confirmedEmail: false,
    });
    expect(jwt.verify(body.refreshToken, apiEnv.JWT_SECRET)).toMatchObject({
      type: 'refresh',
      userID: body.user.id,
    });

    expect(await UserModel.findOne({ id: body.user.id })).toMatchObject({
      ...body.user,
      hashPassword: expect.any(String),
      refreshTokens: expect.arrayContaining([body.refreshToken]),
    });
  }, 10000);

  test('Deve retornar um erro por já possuir um usuário com o mesmo email', async () => {
    const requestData = {
      username: 'nome de usuário',
      email: 'user_email2@domain.com.country',
      password: 'mysecure@password2023',
    };

    await supertest(app).post('/api/users').send(requestData);

    const { body, status } = await supertest(app)
      .post('/api/users')
      .send(requestData);

    expect(status).toBe(400);

    expect(body).toEqual({
      error:
        'There is already user document with this email: ' + requestData.email,
      propName: 'email',
      prop: requestData.email,
      entityName: 'user',
      code: 101,
      name: 'There is already entity with this prop',
    });
  });

  test('Deve retornar um erro por falta do username', async () => {
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

  test('Deve retornar um erro por falta do email', async () => {
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

  test('Deve retornar um erro por falta do password', async () => {
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

  test('Deve retornar um erro pelo username ter um tipo inválido', async () => {
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

  test('Deve retornar um erro pelo email ter um tipo inválido', async () => {
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

  test('Deve retornar um erro pelo password ter um tipo inválido', async () => {
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

  test('Deve retornar um erro pelo username ser pequeno demais', async () => {
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

  test('Deve retornar um erro pelo username ser grande demais', async () => {
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

  test('Deve retornar um erro pelo username ter caracteres inválidos', async () => {
    const requestData = {
      username: 'username💛',
      email: 'user_email2@domain.com.country',
      password: 'mysecure@password2023',
    };

    const { body, status } = await supertest(app)
      .post('/api/users')
      .send(requestData);

    expect(status).toBe(400);

    expect(body).toEqual({
      error: `The username "${requestData.username}" is invalid: invalid characters. Expected: It must only contain alphanumeric characters (some may be accented), spaces, underscores and some special characters`,
      name: 'Invalid param',
      code: 100,
      paramName: 'username',
      param: requestData.username,
      reason: 'invalid characters',
      expected:
        'It must only contain alphanumeric characters (some may be accented), spaces, underscores and some special characters',
    });
  });

  test('Deve retornar um erro pelo email ser grande demais', async () => {
    const requestData = {
      username: 'username',
      email: ('a'.repeat(129) + '@domain.com.country').slice(-129),
      password: 'mysecure@password2023',
    };

    const { body, status } = await supertest(app)
      .post('/api/users')
      .send(requestData);

    expect(status).toBe(400);

    expect(body).toEqual({
      error: `The email "${requestData.email}" is invalid: greater than the maximum characters. Expected: Less or equal than 128 characters`,
      name: 'Invalid param',
      code: 100,
      paramName: 'email',
      param: requestData.email,
      reason: 'greater than the maximum characters',
      expected: 'Less or equal than 128 characters',
    });
  });

  test('Deve retornar um erro pelo email ter 2 arrobas (@)', async () => {
    const requestData = {
      username: 'username',
      email: 'username@lastname@domain.com',
      password: 'mysecure@password2023',
    };

    const { body, status } = await supertest(app)
      .post('/api/users')
      .send(requestData);

    expect(status).toBe(400);

    expect(body).toEqual({
      error: `The email "${requestData.email}" is invalid: incorrect structure. Expected: An email address must have one and only one at sign`,
      name: 'Invalid param',
      code: 100,
      paramName: 'email',
      param: requestData.email,
      reason: 'incorrect structure',
      expected: 'An email address must have one and only one at sign',
    });
  });

  test('Deve retornar um erro pela primeira parte do email ter caracteres inválidos', async () => {
    const requestData = {
      username: 'username',
      email: 'username₱@domain.com',
      password: 'mysecure@password2023',
    };

    const { body, status } = await supertest(app)
      .post('/api/users')
      .send(requestData);

    expect(status).toBe(400);

    expect(body).toEqual({
      error: `The email "${requestData.email}" is invalid: invalid characters. Expected: The first part of an email must contain letters, numbers or some special characters`,
      name: 'Invalid param',
      code: 100,
      paramName: 'email',
      param: requestData.email,
      reason: 'invalid characters',
      expected:
        'The first part of an email must contain letters, numbers or some special characters',
    });
  });

  test('Deve retornar um erro pelo domínio do email não ter pelo menos um ponto separador', async () => {
    const requestData = {
      username: 'username',
      email: 'username@domain',
      password: 'mysecure@password2023',
    };

    const { body, status } = await supertest(app)
      .post('/api/users')
      .send(requestData);

    expect(status).toBe(400);

    expect(body).toEqual({
      error: `The email "${requestData.email}" is invalid: incorrect structure. Expected: The domain of an email must contain at least one period to separate the domain name of the TLD, among other parts`,
      name: 'Invalid param',
      code: 100,
      paramName: 'email',
      param: requestData.email,
      reason: 'incorrect structure',
      expected:
        'The domain of an email must contain at least one period to separate the domain name of the TLD, among other parts',
    });
  });

  test('Deve retornar um erro por caracteres inválidos no domínio do email', async () => {
    const requestData = {
      username: 'username',
      email: 'username@domain*beauty.com',
      password: 'mysecure@password2023',
    };

    const { body, status } = await supertest(app)
      .post('/api/users')
      .send(requestData);

    expect(status).toBe(400);

    expect(body).toEqual({
      error: `The email "${requestData.email}" is invalid: invalid characters. Expected: The domain of an email must contain only alphanumeric characters, hyphens and periods`,
      name: 'Invalid param',
      code: 100,
      paramName: 'email',
      param: requestData.email,
      reason: 'invalid characters',
      expected:
        'The domain of an email must contain only alphanumeric characters, hyphens and periods',
    });
  });

  test('Deve retornar um erro pela senha ser pequena demais', async () => {
    const requestData = {
      username: 'username',
      email: 'username@domain.com',
      password: 'pass1',
    };

    const { body, status } = await supertest(app)
      .post('/api/users')
      .send(requestData);

    expect(status).toBe(400);

    expect(body).toEqual({
      error: `The password "${requestData.password}" is invalid: less than the minimum characters. Expected: More or equal than 6 characters`,
      name: 'Invalid param',
      code: 100,
      paramName: 'password',
      param: requestData.password,
      reason: 'less than the minimum characters',
      expected: 'More or equal than 6 characters',
    });
  });

  test('Deve retornar um erro pela senha ser grande demais', async () => {
    const requestData = {
      username: 'username',
      email: 'username@domain.com',
      password: 'p'.repeat(101) + '1',
    };

    const { body, status } = await supertest(app)
      .post('/api/users')
      .send(requestData);

    expect(status).toBe(400);

    expect(body).toEqual({
      error: `The password "${requestData.password}" is invalid: greater than the maximum characters. Expected: Less or equal than 100 characters`,
      name: 'Invalid param',
      code: 100,
      paramName: 'password',
      param: requestData.password,
      reason: 'greater than the maximum characters',
      expected: 'Less or equal than 100 characters',
    });
  });

  test('Deve retornar um erro pela senha não possuir letras', async () => {
    const requestData = {
      username: 'username',
      email: 'username@domain.com',
      password: '123456',
    };

    const { body, status } = await supertest(app)
      .post('/api/users')
      .send(requestData);

    expect(status).toBe(400);

    expect(body).toEqual({
      error: `The password "${requestData.password}" is invalid: incorrect structure. Expected: At least one letter`,
      name: 'Invalid param',
      code: 100,
      paramName: 'password',
      param: requestData.password,
      reason: 'incorrect structure',
      expected: 'At least one letter',
    });
  });

  test('Deve retornar um erro pela senha não possuir números', async () => {
    const requestData = {
      username: 'username',
      email: 'username@domain.com',
      password: 'abcdef',
    };

    const { body, status } = await supertest(app)
      .post('/api/users')
      .send(requestData);

    expect(status).toBe(400);

    expect(body).toEqual({
      error: `The password "${requestData.password}" is invalid: incorrect structure. Expected: At least one number`,
      name: 'Invalid param',
      code: 100,
      paramName: 'password',
      param: requestData.password,
      reason: 'incorrect structure',
      expected: 'At least one number',
    });
  });
});
