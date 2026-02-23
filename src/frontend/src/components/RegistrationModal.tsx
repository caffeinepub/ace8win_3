import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useRegisterUser } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

export default function RegistrationModal() {
  const [gameUid, setGameUid] = useState('');
  const [gameName, setGameName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [refundQrFile, setRefundQrFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const registerMutation = useRegisterUser();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setRefundQrFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gameUid || !gameName || !phoneNumber || !refundQrFile) {
      toast.error('Please fill all fields and upload refund QR code');
      return;
    }

    if (phoneNumber.length !== 10 || !['7', '8', '9'].includes(phoneNumber[0])) {
      toast.error('Please enter a valid 10-digit phone number starting with 7, 8, or 9');
      return;
    }

    try {
      const arrayBuffer = await refundQrFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await registerMutation.mutateAsync({
        gameUid,
        gameName,
        phoneNumber,
        refundQr: uint8Array,
      });

      toast.success('Registration successful! Welcome to ACE8WIN');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-neon-cyan">Welcome to ACE8WIN</DialogTitle>
          <DialogDescription>Complete your registration to start playing</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gameUid">Game UID</Label>
            <Input
              id="gameUid"
              value={gameUid}
              onChange={(e) => setGameUid(e.target.value)}
              placeholder="Enter your game UID"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gameName">Game Name</Label>
            <Input
              id="gameName"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Enter your game name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">WhatsApp Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter 10-digit phone number"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="refundQr">Refund QR Code</Label>
            <div className="flex items-center gap-2">
              <Input
                id="refundQr"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer"
                required
              />
              {refundQrFile && <Upload className="h-5 w-5 text-neon-green" />}
            </div>
            <p className="text-xs text-muted-foreground">Upload your payment QR code for refunds</p>
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

          <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? 'Registering...' : 'Complete Registration'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
