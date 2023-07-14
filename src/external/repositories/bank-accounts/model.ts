import { model, Schema } from 'mongoose';

export const bankAccountSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    initialAmount: {
      type: Number,
      required: true,
    },
    imageURL: {
      type: String,
      required: false,
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

export const BankAccountModel = model('BankAccount', bankAccountSchema);
