'use client';

import { useEffect, useState } from 'react';
import { getTransactionById } from '@/lib/actions';
import type { Transaction } from '@/lib/types';
import TransactionForm from '@/components/transaction-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function EditTransactionPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.uid) {
      getTransactionById(params.id, user.uid)
        .then((data) => {
          if (data) {
            setTransaction(data);
          } else {
            setError('Transaction not found.');
          }
        })
        .catch(() => setError('Failed to fetch transaction.'))
        .finally(() => setLoading(false));
    }
  }, [params.id, user?.uid]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Transaction</CardTitle>
          <CardDescription>Update the details of your transaction.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {error && <p className="text-destructive text-center">{error}</p>}
          {!loading && transaction && (
            <TransactionForm transaction={transaction} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
