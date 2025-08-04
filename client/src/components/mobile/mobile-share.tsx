import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MobileShareProps {
  title: string;
  text: string;
  url?: string;
  files?: string[];
  className?: string;
  children?: React.ReactNode;
}

export default function MobileShare({ 
  title, 
  text, 
  url, 
  files, 
  className,
  children 
}: MobileShareProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    if (!Capacitor.isNativePlatform()) {
      // Fallback to Web Share API or copy to clipboard
      if (navigator.share) {
        try {
          await navigator.share({
            title,
            text,
            url,
          });
        } catch (error) {
          console.error('Error sharing:', error);
        }
      } else {
        // Copy to clipboard as fallback
        const shareText = `${title}\n${text}${url ? `\n${url}` : ''}`;
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to Clipboard",
          description: "Share content has been copied to clipboard",
        });
      }
      return;
    }

    try {
      await Share.share({
        title,
        text,
        url,
        dialogTitle: 'Share via',
      });
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Share Failed",
        description: "Unable to share content. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (children) {
    return (
      <div onClick={handleShare} className={className}>
        {children}
      </div>
    );
  }

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className={className}
    >
      <Share2 className="w-4 h-4 mr-2" />
      Share
    </Button>
  );
}

// Helper functions for common sharing scenarios
export const shareReportCard = async (studentName: string, grade: string) => {
  const title = `${studentName}'s Report Card`;
  const text = `${studentName} has received their report card for ${grade}. Check the EduManage app for details.`;
  
  if (Capacitor.isNativePlatform()) {
    await Share.share({
      title,
      text,
      dialogTitle: 'Share Report Card',
    });
  } else if (navigator.share) {
    await navigator.share({ title, text });
  }
};

export const shareFeeReceipt = async (studentName: string, amount: number, receiptId: string) => {
  const title = `Fee Receipt - ${studentName}`;
  const text = `Fee payment of $${amount} received for ${studentName}. Receipt ID: ${receiptId}`;
  
  if (Capacitor.isNativePlatform()) {
    await Share.share({
      title,
      text,
      dialogTitle: 'Share Fee Receipt',
    });
  } else if (navigator.share) {
    await navigator.share({ title, text });
  }
};

export const shareAttendanceReport = async (studentName: string, attendancePercentage: number) => {
  const title = `${studentName}'s Attendance Report`;
  const text = `${studentName}'s current attendance: ${attendancePercentage}%. View detailed report in EduManage app.`;
  
  if (Capacitor.isNativePlatform()) {
    await Share.share({
      title,
      text,
      dialogTitle: 'Share Attendance Report',
    });
  } else if (navigator.share) {
    await navigator.share({ title, text });
  }
};