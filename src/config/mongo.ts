import mongoose from 'mongoose';

import { apiEnv } from './env';

export async function connect() {
  try {
    await mongoose.connect(apiEnv.MONGO_URI);

    console.log('→ Connected to MongoDB');
  } catch (e) {
    console.error(`Erro: ${e}`);
  }
}
