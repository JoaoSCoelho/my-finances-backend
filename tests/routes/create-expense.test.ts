import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../src/config/app';
import { apiEnv } from '../../src/config/env';
import { Moment } from '../../src/external/generator-id-providers/moment';
import { BankAccountModel } from '../../src/external/repositories/bank-accounts/model';
import { ExpenseModel } from '../../src/external/repositories/expenses/model';
import { UserModel } from '../../src/external/repositories/users/model';

const moment = new Moment();

describe('Rota de criação de uma despesa', () => {
  beforeAll(async () => {
    await ExpenseModel.deleteMany();
  }, 15000);

  afterAll(async () => {
    await ExpenseModel.deleteMany();
    await mongoose.connection.close();
  }, 15000);

  test('Deve criar uma nova despesa', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const bankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const expenseData = {
      spent: 52,
      title: 'Roupas na shopee',
      description: 'Meias: 12\nCuecas: 30\nÓculos: 10',
      bankAccountId: bankAccountData.id,
    };

    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    await BankAccountModel.create(bankAccountData);

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
      .post('/api/transactions/expenses')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(expenseData);

    expect(body).toEqual({
      expense: {
        ...expenseData,
        id: expect.any(String),
        createdTimestamp: expect.any(Number),
      },
      newBankAccountAmount: bankAccountData.initialAmount - expenseData.spent,
    });

    expect(status).toBe(201);

    const dbExpense = await ExpenseModel.findOne({ id: body.expense.id });

    expect(dbExpense).toMatchObject(body.expense);
  }, 15000);

  test('Deve criar uma nova despesa sem descrição', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const bankAccountData = {
      initialAmount: 2000.5,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco 2',
      userId: userCredentials.id,
    };

    const expenseData = {
      spent: 52.25,
      title: 'Roupas na shopee',
      bankAccountId: bankAccountData.id,
    };

    await UserModel.create({
      ...userCredentials,
      password: undefined,
      refreshTokens: [],
      hashPassword: bcrypt.hashSync(userCredentials.password, 10),
    });

    await BankAccountModel.create(bankAccountData);

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
      .post('/api/transactions/expenses')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(expenseData);

    expect(body).toEqual({
      expense: {
        ...expenseData,
        id: expect.any(String),
        createdTimestamp: expect.any(Number),
      },
      newBankAccountAmount: bankAccountData.initialAmount - expenseData.spent,
    });

    expect(status).toBe(201);

    const dbExpense = await ExpenseModel.findOne({ id: body.expense.id });

    expect(dbExpense).toMatchObject(body.expense);
  }, 15000);

  test('Deve criar uma nova despesa sem as propriedades extras passadas no body da requisição', async () => {});

  test('Deve retornar um erro por não ter o email confirmado', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: false,
    };

    const bankAccountData = {
      initialAmount: 2000.5,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco 2',
      userId: userCredentials.id,
    };

    const expenseData = {
      spent: 52.25,
      title: 'Roupas na shopee',
      bankAccountId: bankAccountData.id,
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
      .post('/api/transactions/expenses')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(expenseData);

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

    const bankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const expenseData = {
      spent: 52,
      description: 'Meias: 12\nCuecas: 30\nÓculos: 10',
      bankAccountId: bankAccountData.id,
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
      .post('/api/transactions/expenses')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(expenseData);

    expect(body).toEqual({
      code: 103,
      name: 'Missing param',
      error: 'Missing param: title',
      paramName: 'title',
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro por não ter o spent', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const bankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const expenseData = {
      title: 'Roupas na shopee',
      description: 'Meias: 12\nCuecas: 30\nÓculos: 10',
      bankAccountId: bankAccountData.id,
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
      .post('/api/transactions/expenses')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(expenseData);

    expect(body).toEqual({
      code: 103,
      name: 'Missing param',
      paramName: 'spent',
      error: 'Missing param: spent',
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro por não ter o bankAccountId', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const expenseData = {
      spent: 52,
      title: 'Roupas na shopee',
      description: 'Meias: 12\nCuecas: 30\nÓculos: 10',
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
      .post('/api/transactions/expenses')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(expenseData);

    expect(body).toEqual({
      code: 103,
      error: 'Missing param: bankAccountId',
      name: 'Missing param',
      paramName: 'bankAccountId',
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

    const bankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const expenseData = {
      spent: 52,
      title: 'aa',
      description: 'Meias: 12\nCuecas: 30\nÓculos: 10',
      bankAccountId: bankAccountData.id,
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
      .post('/api/transactions/expenses')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(expenseData);

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'title',
      param: expenseData.title,
      reason: 'less than the minimum characters',
      expected: 'More or equal than 3 characters',
      error: `The title "${expenseData.title}" is invalid: less than the minimum characters. Expected: More or equal than 3 characters`,
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

    const bankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const expenseData = {
      spent: 52,
      title: 'a'.repeat(51),
      description: 'Meias: 12\nCuecas: 30\nÓculos: 10',
      bankAccountId: bankAccountData.id,
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
      .post('/api/transactions/expenses')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(expenseData);

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'title',
      param: expenseData.title,
      reason: 'greater than the maximum characters',
      expected: 'Less or equal than 50 characters',
      error: `The title "${expenseData.title}" is invalid: greater than the maximum characters. Expected: Less or equal than 50 characters`,
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

    const bankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const expenseData = {
      spent: 52,
      title: false,
      description: 'Meias: 12\nCuecas: 30\nÓculos: 10',
      bankAccountId: bankAccountData.id,
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
      .post('/api/transactions/expenses')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(expenseData);

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'title',
      param: expenseData.title,
      reason: 'type not supported',
      expected: 'string',
      error: `The title "${expenseData.title}" is invalid: type not supported. Expected: string`,
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

    const bankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const expenseData = {
      spent: 52,
      title: 'título↪',
      description: 'Meias: 12\nCuecas: 30\nÓculos: 10',
      bankAccountId: bankAccountData.id,
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
      .post('/api/transactions/expenses')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(expenseData);

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'title',
      param: expenseData.title,
      reason: 'invalid characters',
      expected:
        'It must only contain alphanumeric characters (some may be accented), spaces, underscores and some special characters',
      error: `The title "${expenseData.title}" is invalid: invalid characters. Expected: It must only contain alphanumeric characters (some may be accented), spaces, underscores and some special characters`,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo spent ser do tipo errado', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const bankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const expenseData = {
      spent: [45],
      title: 'título',
      description: 'Meias: 12\nCuecas: 30\nÓculos: 10',
      bankAccountId: bankAccountData.id,
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
      .post('/api/transactions/expenses')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(expenseData);

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'spent',
      param: expenseData.spent,
      reason: 'type not supported',
      expected: 'number',
      error: `The spent "${expenseData.spent}" is invalid: type not supported. Expected: number`,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo spent ser negativo', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const bankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const expenseData = {
      spent: -45,
      title: 'título',
      description: 'Meias: 12\nCuecas: 30\nÓculos: 10',
      bankAccountId: bankAccountData.id,
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
      .post('/api/transactions/expenses')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(expenseData);

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'spent',
      param: expenseData.spent,
      reason: 'less than the minimum',
      expected: 'More or equal than 0',
      error: `The spent "${expenseData.spent}" is invalid: less than the minimum. Expected: More or equal than 0`,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo spent ser maior que o máximo', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const bankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const expenseData = {
      spent: 1000000000000,
      title: 'título',
      description: 'Meias: 12\nCuecas: 30\nÓculos: 10',
      bankAccountId: bankAccountData.id,
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
      .post('/api/transactions/expenses')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(expenseData);

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'spent',
      param: expenseData.spent,
      reason: 'greater than the maximum',
      expected: 'Less or equal than 999999999999',
      error: `The spent "${expenseData.spent}" is invalid: greater than the maximum. Expected: Less or equal than 999999999999`,
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

    const bankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const expenseData = {
      spent: 450,
      title: 'título',
      description: 45,
      bankAccountId: bankAccountData.id,
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
      .post('/api/transactions/expenses')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(expenseData);

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'description',
      param: expenseData.description,
      reason: 'type not supported',
      expected: 'string',
      error: `The description "${expenseData.description}" is invalid: type not supported. Expected: string`,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo bankAccountId ser do tipo errado', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const bankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const expenseData = {
      spent: 450,
      title: 'título',
      description: 'Descrição detalhada',
      bankAccountId: { id: bankAccountData.id },
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
      .post('/api/transactions/expenses')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(expenseData);

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'bankAccountId',
      param: expenseData.bankAccountId,
      reason: 'type not supported',
      expected: 'string',
      error: `The bankAccountId "${expenseData.bankAccountId}" is invalid: type not supported. Expected: string`,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo bankAccountId ser de um tamanho incoerente', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const expenseData = {
      spent: 450,
      title: 'título',
      description: 'Descrição detalhada',
      bankAccountId: '4654',
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
      .post('/api/transactions/expenses')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(expenseData);

    expect(body).toEqual({
      code: 100,
      name: 'Invalid param',
      paramName: 'bankAccountId',
      param: expenseData.bankAccountId,
      reason: 'incorrect structure',
      expected: 'Size must be equal to 21 characters',
      error: `The bankAccountId "${expenseData.bankAccountId}" is invalid: incorrect structure. Expected: Size must be equal to 21 characters`,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo bankAccountId ser de um bankAccount que não existe', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: faker.internet.email(),
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const bankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: userCredentials.id,
    };

    const expenseData = {
      spent: 450,
      title: 'título',
      description: 'Descrição detalhada',
      bankAccountId: bankAccountData.id,
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
      .post('/api/transactions/expenses')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(expenseData);

    expect(body).toEqual({
      code: 104,
      name: 'There is no entity with this prop',
      error: `There is no bankAccount document with this id: ${expenseData.bankAccountId}`,
      entityName: 'bankAccount',
      propName: 'id',
      prop: expenseData.bankAccountId,
    });

    expect(status).toBe(400);
  });

  test('Deve retornar um erro pelo bankAccountId ser de um bankAccount que não é do usuário', async () => {
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

    const bankAccountData = {
      initialAmount: 2000,
      createdTimestamp: Date.now(),
      id: moment.generate(),
      name: 'Meu banco',
      userId: otherUserCredentials.id,
    };

    const expenseData = {
      spent: 450,
      title: 'título',
      description: 'Descrição detalhada',
      bankAccountId: bankAccountData.id,
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
      .post('/api/transactions/expenses')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(expenseData);

    expect(body).toEqual({
      code: 104,
      name: 'There is no entity with this prop',
      error: `There is no bankAccount document with this id: ${expenseData.bankAccountId}`,
      entityName: 'bankAccount',
      propName: 'id',
      prop: expenseData.bankAccountId,
    });

    expect(status).toBe(400);
  });
});
