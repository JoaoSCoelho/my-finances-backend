import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import supertest from 'supertest';

import config from '../../config.json';
import { app } from '../../src/config/app';
import { apiEnv } from '../../src/config/env';
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
    const {
      body: { refreshToken },
    } = await supertest(app).post('/api/users').send({
      username: 'teste',
      email: 'teste@teste.com',
      password: 'senha123',
    });

    const { body, status } = await new Promise<any>((resolve) =>
      setTimeout(() => {
        supertest(app)
          .post('/api/auth/refreshtoken')
          .send({ refreshToken })
          .then(resolve);
      }, 2000),
    );

    expect(body).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });

    expect(body.refreshToken).not.toMatch(refreshToken);

    expect(status).toBe(200);

    const dbUser = await UserModel.findOne({ email: 'teste@teste.com' });

    expect(dbUser?.refreshTokens).toContain(body.refreshToken);

    expect(dbUser?.refreshTokens).not.toContain(refreshToken);
  }, 10000);

  test('Deve retornar um novo accessToken e refreshToken e substituir o refreshToken no banco sem excluir o outro refreshToken existente', async () => {
    const userCredentials = {
      username: 'teste',
      email: 'teste2@teste.com',
      password: 'senha123',
    };

    const {
      body: { refreshToken },
    } = await supertest(app).post('/api/users').send(userCredentials);

    const {
      body: { refreshToken: otherRefreshToken },
    } = await new Promise<any>((resolve) => {
      setTimeout(() => {
        supertest(app)
          .post('/api/login')
          .send({
            email: userCredentials.email,
            password: userCredentials.password,
          })
          .then(resolve);
      }, 2000);
    });

    const { body, status } = await new Promise<any>((resolve) =>
      setTimeout(() => {
        supertest(app)
          .post('/api/auth/refreshtoken')
          .send({ refreshToken })
          .then(resolve);
      }, 2000),
    );

    expect(body).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });

    expect(body.refreshToken).not.toMatch(refreshToken);

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

    expect(body).toMatchObject({
      name: 'Missing param',
      paramName: 'refreshToken',
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
});
