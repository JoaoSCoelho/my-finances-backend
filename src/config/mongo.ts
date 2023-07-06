import mongoose from 'mongoose';

import { apiEnv } from './env';

export async function connect() {
  try {
    await mongoose.connect(
      `${apiEnv.MONGO_URI}/${
        process.env.NODE_ENV === 'test' ? 'test' : 'db'
      }?retryWrites=true&w=majority`,
    );

    console.log('→ Connected to MongoDB');
  } catch (e) {
    console.error(`Erro: ${e}`);
  }
}
