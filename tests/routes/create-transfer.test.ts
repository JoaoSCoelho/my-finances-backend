import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../src/config/app';
import { apiEnv } from '../../src/config/env';
import { Moment } from '../../src/external/generator-id-providers/moment';
import { BankAccountModel } from '../../src/external/repositories/bank-accounts/model';
import { TransferModel } from '../../src/external/repositories/transfers/model';
import { UserModel } from '../../src/external/repositories/users/model';

const moment = new Moment();

describe('Rota de criação de uma transferência', () => {
  beforeAll(async () => {
    await TransferModel.deleteMany();
  }, 15000);

  afterAll(async () => {
    await TransferModel.deleteMany();
    await mongoose.connection.close();
  }, 15000);

  test('Deve criar uma nova transferência', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const giverBankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const receiverBankAccountData = {
      initialAmount: 2500,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco2',
      userId: userCredentials.id,
    };

    const transferData = {
      amount: 52,
      title: 'Roupas na shopee',
      description: 'Meias: 12\nCuecas: 30\nÓculos: 10',
      giverBankAccountId: giverBankAccountData.id,
      receiverBankAccountId: receiverBankAccountData.id,
    };

    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    await BankAccountModel.create(giverBankAccountData);
    await BankAccountModel.create(receiverBankAccountData);

    const accessToken = jwt.sign(
      {
        type: 'access',
        confirmedEmail: userCredentials.confirmedEmail,
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .post('/api/transactions/transfers')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(transferData);

    expect(body).toEqual({
      transfer: {
        ...transferData,
        id: expect.any(String),
        createdTimestamp: expect.any(Number),
      },
      newGiverBankAccountAmount:
        giverBankAccountData.initialAmount - transferData.amount,
      newReceiverBankAccountAmount:
        receiverBankAccountData.initialAmount + transferData.amount,
    });

    expect(status).toBe(201);

    const dbTransfer = await TransferModel.findOne({ id: body.transfer.id });

    expect(dbTransfer).toMatchObject(body.transfer);
  }, 15000);

  test('Deve criar uma nova transferência sem descrição', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const giverBankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const receiverBankAccountData = {
      initialAmount: 2500,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco2',
      userId: userCredentials.id,
    };

    const transferData = {
      amount: 52,
      title: 'Roupas na shopee',
      giverBankAccountId: giverBankAccountData.id,
      receiverBankAccountId: receiverBankAccountData.id,
    };

    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    await BankAccountModel.create(giverBankAccountData);
    await BankAccountModel.create(receiverBankAccountData);

    const accessToken = jwt.sign(
      {
        type: 'access',
        confirmedEmail: userCredentials.confirmedEmail,
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .post('/api/transactions/transfers')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(transferData);

    expect(body).toEqual({
      transfer: {
        ...transferData,
        id: expect.any(String),
        createdTimestamp: expect.any(Number),
      },
      newGiverBankAccountAmount:
        giverBankAccountData.initialAmount - transferData.amount,
      newReceiverBankAccountAmount:
        receiverBankAccountData.initialAmount + transferData.amount,
    });

    expect(status).toBe(201);

    const dbTransfer = await TransferModel.findOne({ id: body.transfer.id });

    expect(dbTransfer).toMatchObject(body.transfer);
  }, 15000);

  test('Deve criar uma nova transferência sem as propriedades extras passadas no body da requisição', async () => {});

  test('Deve retornar um erro por não ter o email confirmado', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: false,
    };

    const giverBankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const receiverBankAccountData = {
      initialAmount: 2500,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco2',
      userId: userCredentials.id,
    };

    const transferData = {
      amount: 52,
      title: 'Roupas na shopee',
      giverBankAccountId: giverBankAccountData.id,
      receiverBankAccountId: receiverBankAccountData.id,
    };

    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    const accessToken = jwt.sign(
      {
        type: 'access',
        confirmedEmail: userCredentials.confirmedEmail,
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .post('/api/transactions/transfers')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(transferData);

    expect(body).toEqual({
      code: 106,
      name: 'No permissions',
      error: 'No permissions: CONFIRMED_EMAIL',
      permissions: 'CONFIRMED_EMAIL',
    });

    expect(status).toBe(401);
  });

  test('Deve retornar um erro por não ter o title', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const giverBankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const receiverBankAccountData = {
      initialAmount: 2500,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco2',
      userId: userCredentials.id,
    };

    const transferData = {
      amount: 52,
      giverBankAccountId: giverBankAccountData.id,
      receiverBankAccountId: receiverBankAccountData.id,
    };

    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    const accessToken = jwt.sign(
      {
        type: 'access',
        confirmedEmail: userCredentials.confirmedEmail,
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .post('/api/transactions/transfers')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(transferData);

    expect(body).toEqual({
      code: 103,
      name: 'Missing param',
      error: 'Missing param: title',
      paramName: 'title',
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro por não ter o amount', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const giverBankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const receiverBankAccountData = {
      initialAmount: 2500,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco2',
      userId: userCredentials.id,
    };

    const transferData = {
      title: 'Roupas na shopee',
      giverBankAccountId: giverBankAccountData.id,
      receiverBankAccountId: receiverBankAccountData.id,
    };

    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    const accessToken = jwt.sign(
      {
        type: 'access',
        confirmedEmail: userCredentials.confirmedEmail,
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .post('/api/transactions/transfers')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(transferData);

    expect(body).toEqual({
      code: 103,
      name: 'Missing param',
      paramName: 'amount',
      error: 'Missing param: amount',
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro por não ter o giverBankAccountId', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const receiverBankAccountData = {
      initialAmount: 2500,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco2',
      userId: userCredentials.id,
    };

    const transferData = {
      amount: 52,
      title: 'Roupas na shopee',
      receiverBankAccountId: receiverBankAccountData.id,
    };

    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    const accessToken = jwt.sign(
      {
        type: 'access',
        confirmedEmail: userCredentials.confirmedEmail,
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .post('/api/transactions/transfers')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(transferData);

    expect(body).toEqual({
      code: 103,
      error: 'Missing param: giverBankAccountId',
      name: 'Missing param',
      paramName: 'giverBankAccountId',
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro por não ter o receiverBankAccountId', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const giverBankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const transferData = {
      amount: 52,
      title: 'Roupas na shopee',
      giverBankAccountId: giverBankAccountData.id,
    };

    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    const accessToken = jwt.sign(
      {
        type: 'access',
        confirmedEmail: userCredentials.confirmedEmail,
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .post('/api/transactions/transfers')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(transferData);

    expect(body).toEqual({
      code: 103,
      error: 'Missing param: receiverBankAccountId',
      name: 'Missing param',
      paramName: 'receiverBankAccountId',
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo título ser pequeno demais', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const giverBankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const receiverBankAccountData = {
      initialAmount: 2500,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco2',
      userId: userCredentials.id,
    };

    const transferData = {
      amount: 52,
      title: 'a',
      giverBankAccountId: giverBankAccountData.id,
      receiverBankAccountId: receiverBankAccountData.id,
    };

    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    const accessToken = jwt.sign(
      {
        type: 'access',
        confirmedEmail: userCredentials.confirmedEmail,
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .post('/api/transactions/transfers')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(transferData);

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'title',
      param: transferData.title,
      reason: 'less than the minimum characters',
      expected: 'More or equal than 3 characters',
      error: `The title "${transferData.title}" is invalid: less than the minimum characters. Expected: More or equal than 3 characters`,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo título ser grande demais', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const giverBankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const receiverBankAccountData = {
      initialAmount: 2500,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco2',
      userId: userCredentials.id,
    };

    const transferData = {
      amount: 52,
      title: 'a'.repeat(51),
      giverBankAccountId: giverBankAccountData.id,
      receiverBankAccountId: receiverBankAccountData.id,
    };

    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    const accessToken = jwt.sign(
      {
        type: 'access',
        confirmedEmail: userCredentials.confirmedEmail,
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .post('/api/transactions/transfers')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(transferData);

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'title',
      param: transferData.title,
      reason: 'greater than the maximum characters',
      expected: 'Less or equal than 50 characters',
      error: `The title "${transferData.title}" is invalid: greater than the maximum characters. Expected: Less or equal than 50 characters`,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo título ser do tipo errado', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const giverBankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const receiverBankAccountData = {
      initialAmount: 2500,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco2',
      userId: userCredentials.id,
    };

    const transferData = {
      amount: 52,
      title: 11,
      giverBankAccountId: giverBankAccountData.id,
      receiverBankAccountId: receiverBankAccountData.id,
    };

    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    const accessToken = jwt.sign(
      {
        type: 'access',
        confirmedEmail: userCredentials.confirmedEmail,
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .post('/api/transactions/transfers')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(transferData);

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'title',
      param: transferData.title,
      reason: 'type not supported',
      expected: 'string',
      error: `The title "${transferData.title}" is invalid: type not supported. Expected: string`,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo título ter caracteres inválidos', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const giverBankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const receiverBankAccountData = {
      initialAmount: 2500,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco2',
      userId: userCredentials.id,
    };

    const transferData = {
      amount: 52,
      title: 'Roupas na shopee😊',
      giverBankAccountId: giverBankAccountData.id,
      receiverBankAccountId: receiverBankAccountData.id,
    };

    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    const accessToken = jwt.sign(
      {
        type: 'access',
        confirmedEmail: userCredentials.confirmedEmail,
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .post('/api/transactions/transfers')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(transferData);

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'title',
      param: transferData.title,
      reason: 'invalid characters',
      expected:
        'It must only contain alphanumeric characters (some may be accented), spaces, underscores and some special characters',
      error: `The title "${transferData.title}" is invalid: invalid characters. Expected: It must only contain alphanumeric characters (some may be accented), spaces, underscores and some special characters`,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo amount ser do tipo errado', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const giverBankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const receiverBankAccountData = {
      initialAmount: 2500,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco2',
      userId: userCredentials.id,
    };

    const transferData = {
      amount: false,
      title: 'Roupas na shopee',
      giverBankAccountId: giverBankAccountData.id,
      receiverBankAccountId: receiverBankAccountData.id,
    };

    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    const accessToken = jwt.sign(
      {
        type: 'access',
        confirmedEmail: userCredentials.confirmedEmail,
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .post('/api/transactions/transfers')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(transferData);

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'amount',
      param: transferData.amount,
      reason: 'type not supported',
      expected: 'number',
      error: `The amount "${transferData.amount}" is invalid: type not supported. Expected: number`,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo amount ser negativo', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const giverBankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const receiverBankAccountData = {
      initialAmount: 2500,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco2',
      userId: userCredentials.id,
    };

    const transferData = {
      amount: -52,
      title: 'Roupas na shopee',
      giverBankAccountId: giverBankAccountData.id,
      receiverBankAccountId: receiverBankAccountData.id,
    };

    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    const accessToken = jwt.sign(
      {
        type: 'access',
        confirmedEmail: userCredentials.confirmedEmail,
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .post('/api/transactions/transfers')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(transferData);

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'amount',
      param: transferData.amount,
      reason: 'less than the minimum',
      expected: 'More or equal than 0',
      error: `The amount "${transferData.amount}" is invalid: less than the minimum. Expected: More or equal than 0`,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo amount ser maior que o máximo', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const giverBankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const receiverBankAccountData = {
      initialAmount: 2500,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco2',
      userId: userCredentials.id,
    };

    const transferData = {
      amount: 5200000000000,
      title: 'Roupas na shopee',
      giverBankAccountId: giverBankAccountData.id,
      receiverBankAccountId: receiverBankAccountData.id,
    };

    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    const accessToken = jwt.sign(
      {
        type: 'access',
        confirmedEmail: userCredentials.confirmedEmail,
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .post('/api/transactions/transfers')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(transferData);

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'amount',
      param: transferData.amount,
      reason: 'greater than the maximum',
      expected: 'Less or equal than 999999999999',
      error: `The amount "${transferData.amount}" is invalid: greater than the maximum. Expected: Less or equal than 999999999999`,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo description ser do tipo errado', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const giverBankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const receiverBankAccountData = {
      initialAmount: 2500,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco2',
      userId: userCredentials.id,
    };

    const transferData = {
      amount: 52,
      title: 'Roupas na shopee',
      description: {},
      giverBankAccountId: giverBankAccountData.id,
      receiverBankAccountId: receiverBankAccountData.id,
    };

    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    const accessToken = jwt.sign(
      {
        type: 'access',
        confirmedEmail: userCredentials.confirmedEmail,
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .post('/api/transactions/transfers')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(transferData);

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'description',
      param: transferData.description,
      reason: 'type not supported',
      expected: 'string',
      error: `The description "${transferData.description}" is invalid: type not supported. Expected: string`,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo giverBankAccountId ser do tipo errado', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const receiverBankAccountData = {
      initialAmount: 2500,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco2',
      userId: userCredentials.id,
    };

    const transferData = {
      amount: 52,
      title: 'Roupas na shopee',
      giverBankAccountId: true,
      receiverBankAccountId: receiverBankAccountData.id,
    };
    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    const accessToken = jwt.sign(
      {
        type: 'access',
        confirmedEmail: userCredentials.confirmedEmail,
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .post('/api/transactions/transfers')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(transferData);

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'giverBankAccountId',
      param: transferData.giverBankAccountId,
      reason: 'type not supported',
      expected: 'string',
      error: `The giverBankAccountId "${transferData.giverBankAccountId}" is invalid: type not supported. Expected: string`,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo receiverBankAccountId ser do tipo errado', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const giverBankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const transferData = {
      amount: 52,
      title: 'Roupas na shopee',
      giverBankAccountId: giverBankAccountData.id,
      receiverBankAccountId: false,
    };
    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    const accessToken = jwt.sign(
      {
        type: 'access',
        confirmedEmail: userCredentials.confirmedEmail,
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .post('/api/transactions/transfers')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(transferData);

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'receiverBankAccountId',
      param: transferData.receiverBankAccountId,
      reason: 'type not supported',
      expected: 'string',
      error: `The receiverBankAccountId "${transferData.receiverBankAccountId}" is invalid: type not supported. Expected: string`,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo giverBankAccountId ser de um tamanho incoerente', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const receiverBankAccountData = {
      initialAmount: 2500,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco2',
      userId: userCredentials.id,
    };

    const transferData = {
      amount: 52,
      title: 'Roupas na shopee',
      giverBankAccountId: 'id',
      receiverBankAccountId: receiverBankAccountData.id,
    };

    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    const accessToken = jwt.sign(
      {
        type: 'access',
        confirmedEmail: userCredentials.confirmedEmail,
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .post('/api/transactions/transfers')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(transferData);

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'giverBankAccountId',
      param: transferData.giverBankAccountId,
      reason: 'incorrect structure',
      expected: 'Size must be equal to 21 characters',
      error: `The giverBankAccountId "${transferData.giverBankAccountId}" is invalid: incorrect structure. Expected: Size must be equal to 21 characters`,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo receiverBankAccountId ser de um tamanho incoerente', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const giverBankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const transferData = {
      amount: 52,
      title: 'Roupas na shopee',
      giverBankAccountId: giverBankAccountData.id,
      receiverBankAccountId: '1'.repeat(22),
    };

    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    const accessToken = jwt.sign(
      {
        type: 'access',
        confirmedEmail: userCredentials.confirmedEmail,
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .post('/api/transactions/transfers')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(transferData);

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'receiverBankAccountId',
      param: transferData.receiverBankAccountId,
      reason: 'incorrect structure',
      expected: 'Size must be equal to 21 characters',
      error: `The receiverBankAccountId "${transferData.receiverBankAccountId}" is invalid: incorrect structure. Expected: Size must be equal to 21 characters`,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo giverBankAccountId ser de um bankAccount que não existe', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const giverBankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const receiverBankAccountData = {
      initialAmount: 2500,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco2',
      userId: userCredentials.id,
    };

    const transferData = {
      amount: 52,
      title: 'Roupas na shopee',
      giverBankAccountId: giverBankAccountData.id,
      receiverBankAccountId: receiverBankAccountData.id,
    };

    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    await BankAccountModel.create(receiverBankAccountData);

    const accessToken = jwt.sign(
      {
        type: 'access',
        confirmedEmail: userCredentials.confirmedEmail,
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .post('/api/transactions/transfers')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(transferData);

    expect(body).toEqual({
      code: 104,
      name: 'There is no entity with this prop',
      error: `There is no bankAccount document with this id: ${transferData.giverBankAccountId}`,
      entityName: 'bankAccount',
      propName: 'id',
      prop: transferData.giverBankAccountId,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo receiverBankAccountId ser de um bankAccount que não existe', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const giverBankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const receiverBankAccountData = {
      initialAmount: 2500,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco2',
      userId: userCredentials.id,
    };

    const transferData = {
      amount: 52,
      title: 'Roupas na shopee',
      giverBankAccountId: giverBankAccountData.id,
      receiverBankAccountId: receiverBankAccountData.id,
    };

    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    await BankAccountModel.create(giverBankAccountData);

    const accessToken = jwt.sign(
      {
        type: 'access',
        confirmedEmail: userCredentials.confirmedEmail,
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .post('/api/transactions/transfers')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(transferData);

    expect(body).toEqual({
      code: 104,
      name: 'There is no entity with this prop',
      error: `There is no bankAccount document with this id: ${transferData.receiverBankAccountId}`,
      entityName: 'bankAccount',
      propName: 'id',
      prop: transferData.receiverBankAccountId,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo giverBankAccountId ser de um bankAccount que não é do usuário', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const otherUserCredentials = {
      username: 'Nome de usuario2',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const giverBankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: otherUserCredentials.id,
    };

    const receiverBankAccountData = {
      initialAmount: 2500,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco2',
      userId: userCredentials.id,
    };

    const transferData = {
      amount: 52,
      title: 'Roupas na shopee',
      giverBankAccountId: giverBankAccountData.id,
      receiverBankAccountId: receiverBankAccountData.id,
    };

    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    await UserModel.create({
      ...otherUserCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(otherUserCredentials.password, 10),
    });

    await BankAccountModel.create(giverBankAccountData);
    await BankAccountModel.create(receiverBankAccountData);

    const accessToken = jwt.sign(
      {
        type: 'access',
        confirmedEmail: userCredentials.confirmedEmail,
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .post('/api/transactions/transfers')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(transferData);

    expect(body).toEqual({
      code: 104,
      name: 'There is no entity with this prop',
      error: `There is no bankAccount document with this id: ${transferData.giverBankAccountId}`,
      entityName: 'bankAccount',
      propName: 'id',
      prop: transferData.giverBankAccountId,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo receiverBankAccountId ser de um bankAccount que não é do usuário', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const otherUserCredentials = {
      username: 'Nome de usuario2',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const giverBankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const receiverBankAccountData = {
      initialAmount: 2500,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco2',
      userId: otherUserCredentials.id,
    };

    const transferData = {
      amount: 52,
      title: 'Roupas na shopee',
      giverBankAccountId: giverBankAccountData.id,
      receiverBankAccountId: receiverBankAccountData.id,
    };

    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    await UserModel.create({
      ...otherUserCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(otherUserCredentials.password, 10),
    });

    await BankAccountModel.create(giverBankAccountData);
    await BankAccountModel.create(receiverBankAccountData);

    const accessToken = jwt.sign(
      {
        type: 'access',
        confirmedEmail: userCredentials.confirmedEmail,
        userID: userCredentials.id,
      },
      apiEnv.JWT_SECRET,
      { expiresIn: '1min' },
    );

    const { body, status } = await supertest(app)
      .post('/api/transactions/transfers')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(transferData);

    expect(body).toEqual({
      code: 104,
      name: 'There is no entity with this prop',
      error: `There is no bankAccount document with this id: ${transferData.receiverBankAccountId}`,
      entityName: 'bankAccount',
      propName: 'id',
      prop: transferData.receiverBankAccountId,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo giverBankAccountId ser igual ao receiverBankAccountId', async () => {});
});
