import { useGetAllMatches } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import MatchCard from '../components/MatchCard';
import { Trophy, Loader2 } from 'lucide-react';

export default function UserDashboard() {
  const { identity } = useInternetIdentity();
  const { data: matches, isLoading } = useGetAllMatches();

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Trophy className="h-20 w-20 text-neon-cyan mb-6" />
        <h1 className="text-4xl font-black mb-4 text-neon-cyan">Welcome to ACE8WIN</h1>
        <p className="text-lg text-muted-foreground mb-8">Login to view and join competitive 1vs1 matches</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-neon-cyan" />
      </div>
    );
  }

  const upcomingMatches = matches?.filter((m) => m.status === 'upcoming') || [];
  const liveMatches = matches?.filter((m) => m.status === 'live') || [];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-black mb-2 text-neon-cyan">Available Matches</h1>
        <p className="text-muted-foreground">Join competitive 1vs1 matches and prove your skills</p>
      </div>

      {liveMatches.length > 0 && (
        <section>
          <h2 className="text-2xl font-black mb-4 text-neon-green flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-neon-green animate-pulse" />
            Live Now
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {liveMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {upcomingMatches.length > 0 && (
        <section>
          <h2 className="text-2xl font-black mb-4 text-foreground">Upcoming Matches</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {upcomingMatches.length === 0 && liveMatches.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">No matches available at the moment</p>
          <p className="text-sm text-muted-foreground">Check back soon for new competitions!</p>
        </div>
      )}
    </div>
  );
}
