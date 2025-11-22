import type { Timestamp } from 'firebase/firestore';

export type User = {
  id: string;
  email: string;
  name: string;
};

export type Transaction = {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  userId: string;
};

export type TransactionFirestore = Omit<Transaction, 'id' | 'date'> & {
  date: Timestamp;
};
