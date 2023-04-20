import { model, Schema } from 'mongoose';

export const expenseSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    spent: {
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

export const ExpenseModel = model('Expense', expenseSchema);
