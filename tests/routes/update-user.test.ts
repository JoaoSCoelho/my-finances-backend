import { faker } from '@faker-js/faker';
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

  test('Deve atualizar o email', async () => {});

  test('Deve atualizar o email e passá-lo para minúsculo', async () => {});

  test('Deve atualizar um email já confirmado', async () => {});

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

  test('Deve atualizar o imageURL de uma string para undefined', async () => {});

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

  test('Deve retornar um erro pelo username ter um tipo inválido', async () => {
    const userCredentials = {
      id: moment.generate(),
      username: faker.person.fullName(),
      email: faker.internet.email(),
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

    const newUsername = 44;

    const { body, status } = await supertest(app)
      .put('/api/users/me')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({
        username: newUsername,
      });

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      param: newUsername,
      paramName: 'username',
      reason: 'type not supported',
      expected: 'string',
      error: `The username "${newUsername}" is invalid: type not supported. Expected: string`,
    });

    expect(status).toBe(400);

    const dbUser = await UserModel.findOne({ id: userCredentials.id });

    expect(dbUser).toMatchObject({
      id: userCredentials.id,
      username: userCredentials.username,
      email: userCredentials.email,
      confirmedEmail: true,
      createdTimestamp: expect.any(Number),
      hashPassword: expect.any(String),
      refreshTokens: [],
    });
  });

  test('Deve retornar um erro pelo username ser menor que o permitido', async () => {
    const userCredentials = {
      id: moment.generate(),
      username: faker.person.fullName(),
      email: faker.internet.email(),
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

    const newUsername = 'a';

    const { body, status } = await supertest(app)
      .put('/api/users/me')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({
        username: newUsername,
      });

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      param: newUsername,
      paramName: 'username',
      reason: 'less than the minimum characters',
      expected: 'More or equal than 3 characters',
      error: `The username "${newUsername}" is invalid: less than the minimum characters. Expected: More or equal than 3 characters`,
    });

    expect(status).toBe(400);

    const dbUser = await UserModel.findOne({ id: userCredentials.id });

    expect(dbUser).toMatchObject({
      id: userCredentials.id,
      username: userCredentials.username,
      email: userCredentials.email,
      confirmedEmail: true,
      createdTimestamp: expect.any(Number),
      hashPassword: expect.any(String),
      refreshTokens: [],
    });
  });

  test('Deve retornar um erro pelo username ser maior que o permitido', async () => {
    const userCredentials = {
      id: moment.generate(),
      username: faker.person.fullName(),
      email: faker.internet.email(),
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

    const newUsername = 'a'.repeat(31);

    const { body, status } = await supertest(app)
      .put('/api/users/me')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({
        username: newUsername,
      });

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      param: newUsername,
      paramName: 'username',
      reason: 'greater than the maximum characters',
      expected: 'Less or equal than 30 characters',
      error: `The username "${newUsername}" is invalid: greater than the maximum characters. Expected: Less or equal than 30 characters`,
    });

    expect(status).toBe(400);

    const dbUser = await UserModel.findOne({ id: userCredentials.id });

    expect(dbUser).toMatchObject({
      id: userCredentials.id,
      username: userCredentials.username,
      email: userCredentials.email,
      confirmedEmail: true,
      createdTimestamp: expect.any(Number),
      hashPassword: expect.any(String),
      refreshTokens: [],
    });
  });

  test('Deve retornar um erro pelo username ter caracteres inválidos', async () => {
    const userCredentials = {
      id: moment.generate(),
      username: faker.person.fullName(),
      email: faker.internet.email(),
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

    const newUsername = 'newuserᓚᘏᗢ';

    const { body, status } = await supertest(app)
      .put('/api/users/me')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({
        username: newUsername,
      });

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      param: newUsername,
      paramName: 'username',
      reason: 'invalid characters',
      expected:
        'It must only contain alphanumeric characters (some may be accented), spaces, underscores and some special characters',
      error: `The username "${newUsername}" is invalid: invalid characters. Expected: It must only contain alphanumeric characters (some may be accented), spaces, underscores and some special characters`,
    });

    expect(status).toBe(400);

    const dbUser = await UserModel.findOne({ id: userCredentials.id });

    expect(dbUser).toMatchObject({
      id: userCredentials.id,
      username: userCredentials.username,
      email: userCredentials.email,
      confirmedEmail: true,
      createdTimestamp: expect.any(Number),
      hashPassword: expect.any(String),
      refreshTokens: [],
    });
  });

  test('Deve retornar um erro pelo profileImageURL ter um tipo inválido', async () => {
    const userCredentials = {
      id: moment.generate(),
      username: faker.person.fullName(),
      email: faker.internet.email(),
      password: 'secure@123',
      profileImageURL:
        'https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2VtfGVufDB8fDB8fHww&w=1000&q=80',
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

    const newProfileImage = 44;

    const { body, status } = await supertest(app)
      .put('/api/users/me')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({
        profileImageURL: newProfileImage,
      });

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      param: newProfileImage,
      paramName: 'profileImageURL',
      reason: 'type not supported',
      expected: 'string',
      error: `The profileImageURL "${newProfileImage}" is invalid: type not supported. Expected: string`,
    });

    expect(status).toBe(400);

    const dbUser = await UserModel.findOne({ id: userCredentials.id });

    expect(dbUser).toMatchObject({
      profileImageURL: userCredentials.profileImageURL,
      id: userCredentials.id,
      username: userCredentials.username,
      email: userCredentials.email,
      confirmedEmail: true,
      createdTimestamp: expect.any(Number),
      hashPassword: expect.any(String),
      refreshTokens: [],
    });
  });

  test('Deve retornar um erro pelo profileImageURL não ter a estrutura de uma URL', async () => {
    const userCredentials = {
      id: moment.generate(),
      username: faker.person.fullName(),
      email: faker.internet.email(),
      password: 'secure@123',
      profileImageURL:
        'https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2VtfGVufDB8fDB8fHww&w=1000&q=80',
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

    const newProfileImage = 'urlnova';

    const { body, status } = await supertest(app)
      .put('/api/users/me')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({
        profileImageURL: newProfileImage,
      });

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      param: newProfileImage,
      paramName: 'profileImageURL',
      reason: 'incorrect structure',
      expected: 'A valid web URL',
      error: `The profileImageURL "${newProfileImage}" is invalid: incorrect structure. Expected: A valid web URL`,
    });

    expect(status).toBe(400);

    const dbUser = await UserModel.findOne({ id: userCredentials.id });

    expect(dbUser).toMatchObject({
      profileImageURL: userCredentials.profileImageURL,
      id: userCredentials.id,
      username: userCredentials.username,
      email: userCredentials.email,
      confirmedEmail: true,
      createdTimestamp: expect.any(Number),
      hashPassword: expect.any(String),
      refreshTokens: [],
    });
  });

  test('Deve retornar um erro por possuir um usuário com o mesmo email', async () => {});

  test('Deve retornar um erro por possuir um usuário com o mesmo email minúsculo', async () => {});
});
