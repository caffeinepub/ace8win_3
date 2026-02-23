import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from '@tanstack/react-router';
import type { Match } from '../backend';
import { Clock, Users, Trophy } from 'lucide-react';
import { useState } from 'react';
import DuplicateJoinWarning from './DuplicateJoinWarning';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  const startDate = new Date(Number(match.startTime) / 1000000);
  const isLive = match.status === 'live';

  const hasJoined = identity ? match.participants.some((p) => p.toString() === identity.getPrincipal().toString()) : false;

  const handleJoinClick = () => {
    if (hasJoined) {
      setShowDuplicateWarning(true);
    } else {
      navigate({ to: '/payment/$matchId', params: { matchId: match.id } });
    }
  };

  const handleConfirmJoin = () => {
    setShowDuplicateWarning(false);
    navigate({ to: '/payment/$matchId', params: { matchId: match.id } });
  };

  return (
    <>
      <Card className="gaming-card group hover:border-neon-cyan/50 transition-all duration-300">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl font-black text-foreground group-hover:text-neon-cyan transition-colors">
              {match.name}
            </CardTitle>
            {isLive && (
              <Badge className="bg-neon-green/20 text-neon-green border-neon-green/50">
                <span className="inline-block h-2 w-2 rounded-full bg-neon-green animate-pulse mr-1" />
                LIVE
              </Badge>
            )}
          </div>
          <CardDescription className="flex items-center gap-2 text-muted-foreground">
            <Trophy className="h-4 w-4" />
            1vs1 Match
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-neon-cyan" />
            <span className="text-foreground/80">
              {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-neon-purple" />
            <span className="text-foreground/80">{match.participants.length} joined</span>
          </div>

          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Entry Fee</span>
              <span className="text-2xl font-black text-neon-green">₹{Number(match.paymentAmount)}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button onClick={handleJoinClick} className="w-full" size="lg">
            {hasJoined ? 'Join Again' : 'Join Match'}
          </Button>
        </CardFooter>
      </Card>

      {showDuplicateWarning && (
        <DuplicateJoinWarning
          matchName={match.name}
          onConfirm={handleConfirmJoin}
          onCancel={() => setShowDuplicateWarning(false)}
        />
      )}
    </>
  );
}
