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
});
