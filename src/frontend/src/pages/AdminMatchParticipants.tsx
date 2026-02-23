import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetMatchParticipants, useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ArrowLeft } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import AccessDeniedScreen from '../components/AccessDeniedScreen';

export default function AdminMatchParticipants() {
  const { matchId } = useParams({ from: '/admin/matches/$matchId/participants' });
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: participants, isLoading: participantsLoading } = useGetMatchParticipants(matchId);

  if (adminLoading || participantsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-neon-cyan" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  const handleWhatsAppClick = (phoneNumber: string) => {
    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
    window.open(`https://wa.me/${formattedNumber}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Button onClick={() => navigate({ to: '/admin/payments' })} variant="ghost">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Payments
      </Button>

      <Card className="gaming-card">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-neon-purple">Match Participants</CardTitle>
          <p className="text-muted-foreground">Match ID: {matchId}</p>
        </CardHeader>
        <CardContent>
          {!participants || participants.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No participants yet</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Game UID</TableHead>
                    <TableHead>Game Name</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((participant, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono">{participant.registrationDetails.gameUid}</TableCell>
                      <TableCell className="font-bold">{participant.registrationDetails.gameName}</TableCell>
                      <TableCell>{participant.registrationDetails.phoneNumber}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleWhatsAppClick(participant.registrationDetails.phoneNumber)}
                          className="gap-2"
                        >
                          <SiWhatsapp className="h-4 w-4" />
                          WhatsApp
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
