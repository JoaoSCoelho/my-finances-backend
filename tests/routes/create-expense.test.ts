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
    await mongoose.connection.close();
  }, 15000);

  test('Deve criar uma nova despesa', async () => {
    const userCredentials = {
      username: 'Nome de usuario',
      id: moment.generate(),
      password: 'senha123',
      email: 'useremail@domain.com',
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const bankAccountData = {
      amount: 2000,
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
      newBankAccountAmount: bankAccountData.amount - expenseData.spent,
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
      email: 'useremail2@domain.com',
      createdTimestamp: Date.now(),
      confirmedEmail: true,
    };

    const bankAccountData = {
      amount: 2000.5,
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
      newBankAccountAmount: bankAccountData.amount - expenseData.spent,
    });

    expect(status).toBe(201);

    const dbExpense = await ExpenseModel.findOne({ id: body.expense.id });

    expect(dbExpense).toMatchObject(body.expense);
  }, 15000);
});
