import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../src/config/app';
import { apiEnv } from '../../src/config/env';
import { Moment } from '../../src/external/generator-id-providers/moment';
import { UserModel } from '../../src/external/repositories/users/model';

const moment = new Moment();

describe('Rota de atualização do usuário', () => {
  beforeAll(async () => {
    await UserModel.deleteMany();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('Deve atualizar o username', async () => {
    const userCredentials = {
      id: moment.generate(),
      username: 'nome de usuario',
      email: 'myemail@mydomain.com',
      password: 'secure@123',
    };

    await UserModel.create({
      id: userCredentials.id,
      username: userCredentials.username,
      email: userCredentials.email,
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
      confirmedEmail: true,
      createdTimestamp: Date.now(),
      refreshTokens: [],
    });

    const accessToken = jwt.sign(
      { type: 'access', userID: userCredentials.id, confirmedEmail: true },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .put('/api/users/me')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({
        username: 'nome alterado',
      });

    expect(body).toEqual({
      updatedUser: {
        id: userCredentials.id,
        username: 'nome alterado',
        email: userCredentials.email,
        confirmedEmail: true,
        createdTimestamp: expect.any(Number),
      },
    });

    expect(status).toBe(200);

    const dbUser = await UserModel.findOne({ id: userCredentials.id });

    expect(dbUser).toMatchObject({
      id: userCredentials.id,
      username: 'nome alterado',
      email: userCredentials.email,
      confirmedEmail: true,
      createdTimestamp: expect.any(Number),
      hashPassword: expect.any(String),
      refreshTokens: [],
    });
  });

  test('Deve atualizar apenas o username', async () => {
    const userCredentials = {
      id: moment.generate(),
      username: 'nome de usuario',
      email: 'myemail2@mydomain.com',
      password: 'secure@123',
      profileImageURL:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1064&q=80',
    };

    await UserModel.create({
      id: userCredentials.id,
      username: userCredentials.username,
      email: userCredentials.email,
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
      confirmedEmail: true,
      createdTimestamp: Date.now(),
      refreshTokens: [],
      profileImageURL: userCredentials.profileImageURL,
    });

    const accessToken = jwt.sign(
      { type: 'access', userID: userCredentials.id, confirmedEmail: true },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .put('/api/users/me')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({
        username: 'nome alterado',
      });

    expect(body).toEqual({
      updatedUser: {
        id: userCredentials.id,
        username: 'nome alterado',
        email: userCredentials.email,
        confirmedEmail: true,
        createdTimestamp: expect.any(Number),
        profileImageURL: userCredentials.profileImageURL,
      },
    });

    expect(status).toBe(200);

    const dbUser = await UserModel.findOne({ id: userCredentials.id });

    expect(dbUser).toMatchObject({
      id: userCredentials.id,
      username: 'nome alterado',
      email: userCredentials.email,
      confirmedEmail: true,
      createdTimestamp: expect.any(Number),
      hashPassword: expect.any(String),
      refreshTokens: [],
      profileImageURL: userCredentials.profileImageURL,
    });
  });

  test('Deve atualizar o imageURL de undefined para uma string', async () => {
    const userCredentials = {
      id: moment.generate(),
      username: 'nome de usuario',
      email: 'myemail3@mydomain.com',
      password: 'secure@123',
      profileImageURL:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1064&q=80',
    };

    await UserModel.create({
      id: userCredentials.id,
      username: userCredentials.username,
      email: userCredentials.email,
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
      confirmedEmail: true,
      createdTimestamp: Date.now(),
      refreshTokens: [],
    });

    const accessToken = jwt.sign(
      { type: 'access', userID: userCredentials.id, confirmedEmail: true },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .put('/api/users/me')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({
        profileImageURL: userCredentials.profileImageURL,
      });

    expect(body).toEqual({
      updatedUser: {
        id: userCredentials.id,
        username: userCredentials.username,
        email: userCredentials.email,
        confirmedEmail: true,
        createdTimestamp: expect.any(Number),
        profileImageURL: userCredentials.profileImageURL,
      },
    });

    expect(status).toBe(200);

    const dbUser = await UserModel.findOne({ id: userCredentials.id });

    expect(dbUser).toMatchObject({
      id: userCredentials.id,
      username: userCredentials.username,
      email: userCredentials.email,
      confirmedEmail: true,
      createdTimestamp: expect.any(Number),
      hashPassword: expect.any(String),
      refreshTokens: [],
      profileImageURL: userCredentials.profileImageURL,
    });
  });

  test('Deve mudar o profileImageURL', async () => {
    const userCredentials = {
      id: moment.generate(),
      username: 'nome de usuario',
      email: 'myemail4@mydomain.com',
      password: 'secure@123',
      profileImageURL:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1064&q=80',
    };

    await UserModel.create({
      id: userCredentials.id,
      username: userCredentials.username,
      email: userCredentials.email,
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
      confirmedEmail: true,
      createdTimestamp: Date.now(),
      refreshTokens: [],
      profileImageURL: userCredentials.profileImageURL,
    });

    const accessToken = jwt.sign(
      { type: 'access', userID: userCredentials.id, confirmedEmail: true },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const newImageURL =
      'https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=699&q=80';

    const { body, status } = await supertest(app)
      .put('/api/users/me')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({
        profileImageURL: newImageURL,
      });

    expect(body).toEqual({
      updatedUser: {
        id: userCredentials.id,
        username: userCredentials.username,
        email: userCredentials.email,
        confirmedEmail: true,
        createdTimestamp: expect.any(Number),
        profileImageURL: newImageURL,
      },
    });

    expect(status).toBe(200);

    const dbUser = await UserModel.findOne({ id: userCredentials.id });

    expect(dbUser).toMatchObject({
      id: userCredentials.id,
      username: userCredentials.username,
      email: userCredentials.email,
      confirmedEmail: true,
      createdTimestamp: expect.any(Number),
      hashPassword: expect.any(String),
      refreshTokens: [],
      profileImageURL: newImageURL,
    });
  });
});
