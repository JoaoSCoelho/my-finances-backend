import { model, Schema } from 'mongoose';

export const userSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
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
      immutable: true,
    },
    refreshTokens: {
      type: [String],
      required: true,
    },
    profileImageURL: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel = model('User', userSchema);
