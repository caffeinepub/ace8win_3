import { useGetTransactionHistory } from '../hooks/useQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, History } from 'lucide-react';
import type { Transaction } from '../backend';

export default function TransactionHistory() {
  const { data: transactions, isLoading } = useGetTransactionHistory();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-neon-cyan" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-neon-green/20 text-neon-green border-neon-green/50">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/50">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/50">Pending</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <History className="h-8 w-8 text-neon-cyan" />
        <h1 className="text-3xl font-black text-neon-cyan">Transaction History</h1>
      </div>

      {!transactions || transactions.length === 0 ? (
        <Card className="gaming-card">
          <CardContent className="text-center py-12">
            <History className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground">Your payment history will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction, index) => (
            <TransactionCard key={index} transaction={transaction} />
          ))}
        </div>
      )}
    </div>
  );
}

function TransactionCard({ transaction }: { transaction: Transaction }) {
  const date = new Date(Number(transaction.time) / 1000000);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-neon-green/20 text-neon-green border-neon-green/50">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/20 text-destructive border-destructive/50">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/50">Pending</Badge>;
    }
  };

  return (
    <Card className="gaming-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-black">{transaction.matchId}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          {getStatusBadge(transaction.paymentStatus)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="text-2xl font-black text-neon-green">₹{Number(transaction.amount)}</p>
          </div>
          {transaction.refundStatus && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Refund Status</p>
              <p className="text-sm font-bold text-neon-cyan">{transaction.refundStatus}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
