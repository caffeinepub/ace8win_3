import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetAllMatches, useSubmitPayment } from '../hooks/useQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import UpiQrCode from '../components/UpiQrCode';

export default function PaymentPage() {
  const { matchId } = useParams({ from: '/payment/$matchId' });
  const navigate = useNavigate();
  const { data: matches } = useGetAllMatches();
  const submitPaymentMutation = useSubmitPayment();

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const match = matches?.find((m) => m.id === matchId);

  if (!match) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Match not found</p>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          Back to Matches
        </Button>
      </div>
    );
  }

  const upiId = 'ace8zonereal@ptyes';
  const amount = Number(match.paymentAmount);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proofFile) {
      toast.error('Please upload payment proof screenshot');
      return;
    }

    try {
      const arrayBuffer = await proofFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await submitPaymentMutation.mutateAsync({
        matchId: match.id,
        amount: BigInt(amount),
        proofScreenshot: blob,
      });

      setIsSubmitted(true);
      toast.success('Payment proof submitted! Waiting for admin approval');
    } catch (error: any) {
      console.error('Payment submission error:', error);
      toast.error(error.message || 'Failed to submit payment proof');
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="gaming-card text-center">
          <CardContent className="pt-12 pb-12">
            <img src="/assets/generated/pending-icon.dim_64x64.png" alt="Pending" className="h-20 w-20 mx-auto mb-6" />
            <h2 className="text-2xl font-black mb-4 text-neon-cyan">Payment Under Review</h2>
            <p className="text-muted-foreground mb-6">
              Your payment proof has been submitted successfully. An admin will review and approve it shortly.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate({ to: '/' })} variant="outline">
                Back to Matches
              </Button>
              <Button onClick={() => navigate({ to: '/transactions' })}>View Transactions</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button onClick={() => navigate({ to: '/' })} variant="ghost" className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Matches
      </Button>

      <Card className="gaming-card">
        <CardHeader>
          <CardTitle className="text-2xl font-black text-neon-cyan">Payment Details</CardTitle>
          <p className="text-muted-foreground">Match: {match.name}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Amount to Pay</p>
              <p className="text-4xl font-black text-neon-green">₹{amount}</p>
            </div>

            <UpiQrCode upiId={upiId} amount={amount} />

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">UPI ID</p>
              <p className="text-lg font-bold text-foreground">{upiId}</p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg text-sm text-left space-y-2">
              <p className="font-bold text-foreground">Payment Instructions:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Scan the QR code with any UPI app</li>
                <li>Complete the payment of ₹{amount}</li>
                <li>Take a screenshot of the payment confirmation</li>
                <li>Upload the screenshot below</li>
              </ol>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proof">Upload Payment Proof</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="proof"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                  required
                />
                {proofFile && <Upload className="h-5 w-5 text-neon-green" />}
              </div>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-neon-cyan transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground">Uploading: {uploadProgress}%</p>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={submitPaymentMutation.isPending}>
              {submitPaymentMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Payment Proof'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
