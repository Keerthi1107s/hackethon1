'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { getDashboardData } from '@/lib/actions';
import type { Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ArrowUpRight, DollarSign, TrendingDown } from 'lucide-react';
import { TRANSACTION_CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';

type DashboardData = {
  totalExpenses: number;
  categoryTotals: { category: string; total: number }[];
  recentTransactions: Transaction[];
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      getDashboardData(user.uid)
        .then((result) => {
          if (result) {
            setData(result);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [user]);
  
  const categoryIconMap = useMemo(() => {
    return new Map(TRANSACTION_CATEGORIES.map(c => [c.value, c.icon]));
  }, []);

  const categoryLabelMap = useMemo(() => {
    return new Map(TRANSACTION_CATEGORIES.map(c => [c.value, c.label]));
  }, []);


  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="m-4 text-center">
        <p>Could not load dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">Total spending across all categories</p>
          </CardContent>
        </Card>
        <Card>
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{data.recentTransactions.length}</div>
            <p className="text-xs text-muted-foreground">In the last 7 days</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Spending summary by category.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.categoryTotals}>
                <XAxis
                  dataKey="category"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => categoryLabelMap.get(value) || value}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value as number)}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  labelFormatter={(label) => categoryLabelMap.get(label) || label}
                  formatter={(value) => [formatCurrency(value as number), 'Total']}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your 5 most recent transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {data.recentTransactions.length > 0 ? (
                  data.recentTransactions.map((tx) => {
                    const Icon = categoryIconMap.get(tx.category);
                    return (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                           {Icon && <div className="rounded-full bg-muted p-2"><Icon className="h-5 w-5 text-muted-foreground" /></div>}
                            <div>
                               <p className="font-medium">{tx.description}</p>
                               <p className="text-sm text-muted-foreground">{categoryLabelMap.get(tx.category) || tx.category}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="font-mono font-medium">{formatCurrency(tx.amount)}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(tx.date)}</p>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      No recent transactions.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
             <div className="mt-4 flex items-center justify-center">
              <Button asChild variant="outline" size="sm">
                <Link href="/transactions">
                  View All Transactions <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-32" /><Skeleton className="h-4 w-48 mt-1" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-5 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-16" /><Skeleton className="h-4 w-40 mt-1" /></CardContent></Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4"><CardHeader><Skeleton className="h-6 w-40" /></CardHeader><CardContent><Skeleton className="h-[350px] w-full" /></CardContent></Card>
        <Card className="col-span-4 lg:col-span-3"><CardHeader><Skeleton className="h-6 w-48" /></CardHeader><CardContent className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</CardContent></Card>
      </div>
    </div>
  );
}
