import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface DuplicateJoinWarningProps {
  matchName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DuplicateJoinWarning({ matchName, onConfirm, onCancel }: DuplicateJoinWarningProps) {
  return (
    <AlertDialog open={true}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <AlertDialogTitle className="text-xl">Already Registered</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            You have already joined <span className="font-bold text-foreground">{matchName}</span>. Are you sure you want to
            join again? This will require another payment.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Proceed Anyway</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
