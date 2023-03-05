import { model, Schema } from 'mongoose';

export const userSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    confirmedEmail: {
      type: Boolean,
      required: true,
    },
    hashPassword: {
      type: String,
      required: true,
    },
    createdTimestamp: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel = model('User', userSchema);
