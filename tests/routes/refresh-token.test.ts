import { faker } from '@faker-js/faker';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import supertest from 'supertest';

import config from '../../config.json';
import { app } from '../../src/config/app';
import { apiEnv } from '../../src/config/env';
import { IUserObject } from '../../src/entities/user';
import { Bcrypt } from '../../src/external/encryptor-providers/bcrypt';
import { Moment } from '../../src/external/generator-id-providers/moment';
import { UserModel } from '../../src/external/repositories/users/model';

const moment = new Moment();
const bcrypt = new Bcrypt();

describe('Rota para renovar o token de acesso do usuário', () => {
  beforeAll(async () => {
    await UserModel.deleteMany();
  }, 15000);

  afterAll(async () => {
    await UserModel.deleteMany();
    await mongoose.connection.close();
  }, 15000);

  test('Deve retornar um novo accessToken e refreshToken e substituir o refreshToken no banco', async () => {
    const userCredentials: Omit<
      IUserObject,
      'hashPassword' | 'refreshTokens'
    > & { password: string } = {
      id: moment.generate(),
      createdTimestamp: Date.now(),
      username: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      confirmedEmail: false,
    };

    const refreshToken = jwt.sign(
      { type: 'refresh', userID: userCredentials.id },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    UserModel.create({
      ...userCredentials,
      password: undefined,
      hashPassword: bcrypt.encrypt(
        userCredentials.password,
        config.default_encryptor_salts,
      ),
      refreshTokens: [refreshToken],
    });

    const { body, status } = await new Promise<any>((resolve) =>
      setTimeout(() => {
        supertest(app)
          .post('/api/auth/refreshtoken')
          .send({ refreshToken })
          .then(resolve);
      }, 1000),
    );

    expect(body).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });

    expect(body.refreshToken).not.toMatch(refreshToken);

    expect(status).toBe(200);

    const dbUser = await UserModel.findOne({ email: userCredentials.email });

    expect(dbUser?.refreshTokens).toContain(body.refreshToken);

    expect(dbUser?.refreshTokens).not.toContain(refreshToken);
  }, 10000);

  test('Deve retornar um novo accessToken e refreshToken e substituir o refreshToken no banco sem excluir o outro refreshToken existente', async () => {
    const userCredentials: Omit<
      IUserObject,
      'hashPassword' | 'refreshTokens'
    > & { password: string } = {
      id: moment.generate(),
      createdTimestamp: Date.now(),
      username: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      confirmedEmail: false,
    };

    const refreshToken = jwt.sign(
      { type: 'refresh', userID: userCredentials.id },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const otherRefreshToken = await new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve(
          jwt.sign(
            { type: 'refresh', userID: userCredentials.id },
            apiEnv.JWT_SECRET,
            { expiresIn: '1min' },
          ),
        );
      }, 1000);
    });

    UserModel.create({
      ...userCredentials,
      password: undefined,
      hashPassword: bcrypt.encrypt(
        userCredentials.password,
        config.default_encryptor_salts,
      ),
      refreshTokens: [refreshToken, otherRefreshToken],
    });

    const { body, status } = await new Promise<any>((resolve) =>
      setTimeout(() => {
        supertest(app)
          .post('/api/auth/refreshtoken')
          .send({ refreshToken })
          .then(resolve);
      }, 1000),
    );

    expect(body).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });

    expect(body.refreshToken).not.toMatch(refreshToken);
    expect(body.refreshToken).not.toMatch(otherRefreshToken);

    expect(status).toBe(200);

    const dbUser = await UserModel.findOne({ email: userCredentials.email });

    expect(dbUser?.refreshTokens).toEqual(
      expect.arrayContaining([body.refreshToken, otherRefreshToken]),
    );

    expect(dbUser?.refreshTokens).not.toContain(refreshToken);
  }, 15000);

  test('Deve retornar um erro pela falta do refreshToken', async () => {
    const { body, status } = await supertest(app).post(
      '/api/auth/refreshtoken',
    );

    expect(body).toEqual({
      code: 103,
      name: 'Missing param',
      paramName: 'refreshToken',
      error: 'Missing param: refreshToken',
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro por token expirado', async () => {
    const userCredentials = {
      username: 'teste',
      email: 'teste3@teste.com',
      password: 'senha123',
      id: moment.generate(),
    };

    const refreshToken = jwt.sign(
      {
        type: 'refresh',
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1s' },
    );

    await UserModel.create({
      id: userCredentials.id,
      createdTimestamp: Date.now(),
      hashPassword: bcrypt.encrypt(
        userCredentials.password,
        config.default_encryptor_salts,
      ),
      username: userCredentials.username,
      email: userCredentials.email,
      confirmedEmail: false,
      refreshTokens: [refreshToken],
    });

    const { body, status } = await new Promise<any>((resolve) => {
      setTimeout(() => {
        supertest(app)
          .post('/api/auth/refreshtoken')
          .send({
            refreshToken,
          })
          .then(resolve);
      }, 1000);
    });

    expect(body).toMatchObject({
      name: 'Invalid param',
      paramName: 'refreshToken',
      param: refreshToken,
      reason: 'expired',
    });

    expect(status).toBe(400);
  }, 10000);

  test('Deve retornar um erro pelo refreshToken ser do tipo incorreto', async () => {
    const userCredentials: Omit<
      IUserObject,
      'hashPassword' | 'refreshTokens'
    > & { password: string } = {
      id: moment.generate(),
      createdTimestamp: Date.now(),
      username: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      confirmedEmail: false,
    };

    const refreshToken = [
      jwt.sign(
        {
          type: 'refresh',
          userID: userCredentials.id,
        },
        apiEnv.JWT_SECRET,
        { expiresIn: '1s' },
      ),
    ];

    UserModel.create({
      ...userCredentials,
      password: undefined,
      hashPassword: bcrypt.encrypt(
        userCredentials.password,
        config.default_encryptor_salts,
      ),
      refreshTokens: [refreshToken.toString()],
    });

    const { body, status } = await new Promise<any>((resolve) =>
      setTimeout(() => {
        supertest(app)
          .post('/api/auth/refreshtoken')
          .send({ refreshToken })
          .then(resolve);
      }, 1000),
    );

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'refreshToken',
      param: refreshToken,
      reason: 'type not supported',
      expected: 'string',
      error: `The refreshToken "${refreshToken}" is invalid: type not supported. Expected: string`,
    });

    expect(status).toBe(400);

    const dbUser = await UserModel.findOne({ email: userCredentials.email });

    expect(dbUser?.refreshTokens).toEqual([refreshToken.toString()]);
  });

  test('Deve retornar um erro por token com estrutura incorreta', async () => {
    const userCredentials: Omit<
      IUserObject,
      'hashPassword' | 'refreshTokens'
    > & { password: string } = {
      id: moment.generate(),
      createdTimestamp: Date.now(),
      username: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      confirmedEmail: false,
    };

    const refreshToken = 'asdas65432';

    UserModel.create({
      ...userCredentials,
      password: undefined,
      hashPassword: bcrypt.encrypt(
        userCredentials.password,
        config.default_encryptor_salts,
      ),
      refreshTokens: [refreshToken],
    });

    const { body, status } = await new Promise<any>((resolve) =>
      setTimeout(() => {
        supertest(app)
          .post('/api/auth/refreshtoken')
          .send({ refreshToken })
          .then(resolve);
      }, 1000),
    );

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'refreshToken',
      param: refreshToken,
      reason: 'invalid',
      expected: 'A valid token',
      error: `The refreshToken "${refreshToken}" is invalid: invalid. Expected: A valid token`,
    });

    expect(status).toBe(400);

    const dbUser = await UserModel.findOne({ email: userCredentials.email });

    expect(dbUser?.refreshTokens).toEqual([refreshToken]);
  });

  test('Deve retornar um erro por ser de um usuário que não existe', async () => {
    const userCredentials = {
      id: moment.generate(),
    };

    const refreshToken = jwt.sign(
      { type: 'refresh', userID: userCredentials.id },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await new Promise<any>((resolve) =>
      setTimeout(() => {
        supertest(app)
          .post('/api/auth/refreshtoken')
          .send({ refreshToken })
          .then(resolve);
      }, 1000),
    );

    expect(body).toEqual({
      code: 104,
      name: 'There is no entity with this prop',
      propName: 'id',
      prop: userCredentials.id,
      entityName: 'user',
      error: `There is no user document with this id: ${userCredentials.id}`,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo token não ser do tipo "refresh"', async () => {
    const userCredentials: Omit<
      IUserObject,
      'hashPassword' | 'refreshTokens'
    > & { password: string } = {
      id: moment.generate(),
      createdTimestamp: Date.now(),
      username: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      confirmedEmail: false,
    };

    const refreshToken = jwt.sign(
      { type: 'refesh', userID: userCredentials.id },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    UserModel.create({
      ...userCredentials,
      password: undefined,
      hashPassword: bcrypt.encrypt(
        userCredentials.password,
        config.default_encryptor_salts,
      ),
      refreshTokens: [refreshToken],
    });

    const { body, status } = await new Promise<any>((resolve) =>
      setTimeout(() => {
        supertest(app)
          .post('/api/auth/refreshtoken')
          .send({ refreshToken })
          .then(resolve);
      }, 1000),
    );

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'refreshToken',
      param: refreshToken,
      reason: 'type not supported',
      expected: 'refresh',
      error: `The refreshToken "${refreshToken}" is invalid: type not supported. Expected: refresh`,
    });

    expect(status).toBe(400);

    const dbUser = await UserModel.findOne({ email: userCredentials.email });

    expect(dbUser?.refreshTokens).toEqual([refreshToken]);
  });

  test('Deve retornar um erro pelo refreshToken não estar cadastrado no usuário', async () => {
    const userCredentials: Omit<
      IUserObject,
      'hashPassword' | 'refreshTokens'
    > & { password: string } = {
      id: moment.generate(),
      createdTimestamp: Date.now(),
      username: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      confirmedEmail: false,
    };

    const refreshToken = jwt.sign(
      { type: 'refresh', userID: userCredentials.id },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    UserModel.create({
      ...userCredentials,
      password: undefined,
      hashPassword: bcrypt.encrypt(
        userCredentials.password,
        config.default_encryptor_salts,
      ),
      refreshTokens: [],
    });

    const { body, status } = await new Promise<any>((resolve) =>
      setTimeout(() => {
        supertest(app)
          .post('/api/auth/refreshtoken')
          .send({ refreshToken })
          .then(resolve);
      }, 1000),
    );

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'refreshToken',
      param: refreshToken,
      reason: 'invalid',
      expected: 'A valid token',
      error: `The refreshToken "${refreshToken}" is invalid: invalid. Expected: A valid token`,
    });

    expect(status).toBe(400);

    const dbUser = await UserModel.findOne({ email: userCredentials.email });

    expect(dbUser?.refreshTokens).toEqual([]);
  });
});
