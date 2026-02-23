import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateMatch, useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';
import AccessDeniedScreen from '../components/AccessDeniedScreen';

export default function AdminMatchCreate() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const createMatchMutation = useCreateMatch();

  const [matchName, setMatchName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [paymentAmount, setPaymentAmount] = useState('');

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-neon-cyan" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!matchName || !startDate || !startTime || !duration || !paymentAmount) {
      toast.error('Please fill all fields');
      return;
    }

    const startDateTime = new Date(`${startDate}T${startTime}`);
    if (startDateTime <= new Date()) {
      toast.error('Start time must be in the future');
      return;
    }

    const amount = parseInt(paymentAmount);
    if (amount <= 0) {
      toast.error('Payment amount must be positive');
      return;
    }

    try {
      await createMatchMutation.mutateAsync({
        name: matchName,
        startTime: BigInt(startDateTime.getTime() * 1000000),
        duration: BigInt(parseInt(duration)),
        paymentAmount: BigInt(amount),
      });

      toast.success('Match created successfully!');
      navigate({ to: '/' });
    } catch (error: any) {
      console.error('Match creation error:', error);
      toast.error(error.message || 'Failed to create match');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="gaming-card">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-neon-purple flex items-center gap-2">
            <Plus className="h-6 w-6" />
            Create New Match
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="matchName">Match Name</Label>
              <Input
                id="matchName"
                value={matchName}
                onChange={(e) => setMatchName(e.target.value)}
                placeholder="e.g., Friday Night Battle"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Entry Fee (₹)</Label>
              <Input
                id="paymentAmount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="100"
                min="1"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate({ to: '/' })} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={createMatchMutation.isPending}>
                {createMatchMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Match'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
