import supertest from 'supertest';

import { app } from '../../src/config/app';
import { UserModel } from '../../src/external/repositories/users/model';

describe('Create user endpoint', () => {
  beforeEach(async () => {
    await UserModel.deleteMany();
  });

  test('should return a new user', async () => {
    const requestData = {
      username: 'nome de usuário',
      email: 'user_email2@domain.com.country',
      password: 'mysecure@password2023',
    };

    const { body, status } = await supertest(app)
      .post('/api/users')
      .send(requestData);

    expect(body).toEqual({
      user: expect.objectContaining({
        username: requestData.username,
        email: requestData.email,
      }),
    });
    expect(status).toBe(201);
    expect(typeof body.user.id).toBe('string');
    expect(typeof body.user.hashPassword).toBe('string');
    expect(body.user.createdTimestamp).toBeLessThanOrEqual(Date.now());
    expect(typeof body.user.createdTimestamp).toBe('number');
    expect(body.user.confirmedEmail).toBe(false);
  });
});
