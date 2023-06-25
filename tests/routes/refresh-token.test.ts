import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../src/config/app';
import { UserModel } from '../../src/external/repositories/users/model';

describe('Rota para renovar o token de acesso do usuário', () => {
  beforeAll(async () => {
    await UserModel.deleteMany();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

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
    const {
      body: { refreshToken },
    } = await supertest(app).post('/api/users').send({
      username: 'teste',
      email: 'teste2@teste.com',
      password: 'senha123',
    });

    const {
      body: { refreshToken: otherRefreshToken },
    } = await new Promise<any>((resolve) => {
      setTimeout(() => {
        supertest(app)
          .post('/api/login')
          .send({
            email: 'teste2@teste.com',
            password: 'senha123',
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

    const dbUser = await UserModel.findOne({ email: 'teste2@teste.com' });

    expect(dbUser?.refreshTokens).toEqual(
      expect.arrayContaining([body.refreshToken, otherRefreshToken]),
    );

    expect(dbUser?.refreshTokens).not.toContain(refreshToken);
  }, 10000);
});
