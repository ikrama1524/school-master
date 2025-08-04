import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera as CameraIcon, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MobileCameraProps {
  onImageCapture?: (imageUrl: string) => void;
  onClose?: () => void;
  title?: string;
}

export default function MobileCamera({ onImageCapture, onClose, title = "Capture Image" }: MobileCameraProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const takePicture = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast({
        title: "Camera Not Available",
        description: "Camera feature is only available in the mobile app",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        setCapturedImage(image.dataUrl);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      toast({
        title: "Camera Error",
        description: "Failed to capture image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectFromGallery = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast({
        title: "Gallery Not Available",
        description: "Gallery feature is only available in the mobile app",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      if (image.dataUrl) {
        setCapturedImage(image.dataUrl);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      toast({
        title: "Gallery Error",
        description: "Failed to select image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (capturedImage && onImageCapture) {
      onImageCapture(capturedImage);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {capturedImage ? (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleRetake} variant="outline" className="flex-1">
                Retake
              </Button>
              <Button onClick={handleConfirm} className="flex-1">
                Use Photo
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col space-y-3">
              <Button
                onClick={takePicture}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2"
              >
                <CameraIcon className="w-4 h-4" />
                <span>{isLoading ? 'Opening Camera...' : 'Take Photo'}</span>
              </Button>
              
              <Button
                onClick={selectFromGallery}
                variant="outline"
                disabled={isLoading}
                className="flex items-center justify-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>{isLoading ? 'Opening Gallery...' : 'Choose from Gallery'}</span>
              </Button>
            </div>
            
            {!Capacitor.isNativePlatform() && (
              <div className="text-center text-sm text-muted-foreground">
                Camera features are available in the mobile app
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}