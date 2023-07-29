import mongoose from 'mongoose';

import { apiEnv } from './env';

export async function connect() {
  try {
    await mongoose.connect(
      process.env.NODE_ENV === 'test'
        ? apiEnv.MONGO_TEST_URI!
        : apiEnv.MONGO_URI,
    );

    console.log('→ Connected to MongoDB');
  } catch (e) {
    console.error(`Erro: ${e}`);
  }
}
