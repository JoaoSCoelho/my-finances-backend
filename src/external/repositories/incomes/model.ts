import { model, Schema } from 'mongoose';

export const incomeSchema = new Schema(
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
    gain: {
      type: Number,
      required: true,
    },
    bankAccountId: {
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

export const IncomeModel = model('Income', incomeSchema);
