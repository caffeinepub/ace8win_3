import { useEffect, useRef, useState } from 'react';

interface UpiQrCodeProps {
  upiId: string;
  amount: number;
}

export default function UpiQrCode({ upiId, amount }: UpiQrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const upiUrl = `upi://pay?pa=${upiId}&pn=ACE8WIN&am=${amount}&cu=INR`;
    
    // Use a third-party QR code API to generate the QR code
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;
    setQrDataUrl(qrApiUrl);
  }, [upiId, amount]);

  return (
    <div className="bg-white p-6 rounded-lg inline-block">
      {qrDataUrl ? (
        <img 
          src={qrDataUrl} 
          alt="UPI Payment QR Code" 
          className="w-[200px] h-[200px]"
          crossOrigin="anonymous"
        />
      ) : (
        <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-100">
          <p className="text-sm text-gray-500">Loading QR Code...</p>
        </div>
      )}
    </div>
  );
}
