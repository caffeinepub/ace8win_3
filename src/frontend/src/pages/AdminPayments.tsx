import { useGetAllMatches, useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import AccessDeniedScreen from '../components/AccessDeniedScreen';

export default function AdminPayments() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: matches, isLoading: matchesLoading } = useGetAllMatches();

  if (adminLoading || matchesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-neon-cyan" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard className="h-8 w-8 text-neon-purple" />
        <h1 className="text-3xl font-black text-neon-purple">Payment Management</h1>
      </div>

      <Card className="gaming-card">
        <CardHeader>
          <CardTitle>Active Matches</CardTitle>
        </CardHeader>
        <CardContent>
          {!matches || matches.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No matches available</p>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-neon-purple/50 transition-colors"
                >
                  <div>
                    <p className="font-bold text-foreground">{match.name}</p>
                    <p className="text-sm text-muted-foreground">{match.participants.length} participants</p>
                  </div>
                  <Button
                    onClick={() => navigate({ to: '/admin/matches/$matchId/participants', params: { matchId: match.id } })}
                    variant="outline"
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
