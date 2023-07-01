import { model, Schema } from 'mongoose';

export const transferSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    giverBankAccountId: {
      type: String,
      required: true,
    },
    receiverBankAccountId: {
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

export const TransferModel = model('Transfer', transferSchema);
