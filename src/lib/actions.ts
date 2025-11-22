'use server';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  orderBy,
  limit,
  getDoc,
  writeBatch,
  setDoc
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { initializeFirebase } from '@/firebase/server';
import type { Transaction, TransactionFirestore, User } from './types';

const { auth, firestore: db } = initializeFirebase();

// AUTH ACTIONS
export async function signUpAction(data: any) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const user = userCredential.user;
    
    // Create a user profile document in Firestore
    const userRef = doc(db, 'users', user.uid);
    // The user ID should be stored in the document
    const newUser: User = {
      id: user.uid,
      email: user.email!,
      name: user.email!.split('@')[0], // Default name from email
    };
    await setDoc(userRef, newUser);

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function signInAction(data: any) {
  try {
    await signInWithEmailAndPassword(auth, data.email, data.password);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function signOutAction() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

// TRANSACTION ACTIONS
function getTransactionsCollection(userId: string) {
    return collection(db, 'users', userId, 'transactions');
}


function transactionFromDoc(doc: any): Transaction {
  const data = doc.data() as TransactionFirestore;
  return {
    id: doc.id,
    ...data,
    date: data.date.toDate(),
  };
}

export async function addTransactionAction(data: Omit<Transaction, 'id'>) {
  try {
    await addDoc(getTransactionsCollection(data.userId), {
      ...data,
      date: Timestamp.fromDate(data.date),
    });
    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { error: 'Failed to add transaction.' };
  }
}

export async function updateTransactionAction(data: Transaction) {
  try {
    const { id, userId, ...transactionData } = data;
    const docRef = doc(db, 'users', userId, 'transactions', id);
    await updateDoc(docRef, {
        ...transactionData,
        date: Timestamp.fromDate(data.date),
    });
    revalidatePath('/transactions');
    revalidatePath(`/transactions/${id}/edit`);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { error: 'Failed to update transaction.' };
  }
}

export async function deleteTransactionAction(id: string, userId: string) {
  try {
    const docRef = doc(db, 'users', userId, 'transactions', id);
    await deleteDoc(docRef);
    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { error: 'Failed to delete transaction.' };
  }
}

export async function getTransactions(userId: string): Promise<Transaction[]> {
  try {
    const q = query(getTransactionsCollection(userId), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(transactionFromDoc);
  } catch (error) {
    console.error('Error getting transactions: ', error);
    return [];
  }
}

export async function getTransactionById(id: string, userId: string): Promise<Transaction | null> {
    try {
        const docRef = doc(db, 'users', userId, 'transactions', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return transactionFromDoc(docSnap);
        }
        return null;
    } catch(error) {
        console.error("Error getting transaction by ID:", error);
        return null;
    }
}


export async function getDashboardData(userId: string) {
  try {
    const q = query(getTransactionsCollection(userId));
    const querySnapshot = await getDocs(q);
    const transactions = querySnapshot.docs.map(transactionFromDoc);

    const totalExpenses = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    const categoryTotals: { [key: string]: number } = {};
    transactions.forEach(tx => {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    });
    const categoryTotalsArray = Object.entries(categoryTotals)
        .map(([category, total]) => ({ category, total }))
        .sort((a, b) => b.total - a.total);


    const recentTransactions = transactions
      .sort((a,b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
      
    return { totalExpenses, categoryTotals: categoryTotalsArray, recentTransactions };
  } catch (error) {
    console.error('Error getting dashboard data: ', error);
    return null;
  }
}