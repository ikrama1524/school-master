import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MobileCamera from '@/components/mobile/mobile-camera';
import MobileShare from '@/components/mobile/mobile-share';
import MobileDashboard from '@/components/mobile/mobile-dashboard';
import { useMobile } from '@/hooks/use-mobile';
import { MobileNotificationService } from '@/services/mobile-notifications';
import { useToast } from '@/hooks/use-toast';
import {
  Camera,
  Bell,
  Share2,
  Smartphone,
  Zap,
  Check
} from 'lucide-react';

export default function MobileTest() {
  const [showCamera, setShowCamera] = useState(false);
  const deviceInfo = useMobile();
  const { toast } = useToast();

  const testNotification = async () => {
    const notificationService = MobileNotificationService.getInstance();
    
    await notificationService.showLocalNotification(
      "Test Notification",
      "This is a test notification from EduManage!",
      { type: "test" }
    );
    
    toast({
      title: "Notification Sent",
      description: "Check your notification panel to see the test notification",
    });
  };

  const scheduleReminder = async () => {
    const notificationService = MobileNotificationService.getInstance();
    
    // Schedule notification for 10 seconds from now
    const scheduleDate = new Date(Date.now() + 10000);
    
    await notificationService.scheduleNotification(
      "Fee Reminder",
      "Don't forget to collect fees from Class 10-A students",
      scheduleDate,
      { type: "fee_reminder" }
    );
    
    toast({
      title: "Reminder Scheduled",
      description: "You'll receive a notification in 10 seconds",
    });
  };

  const handleImageCapture = (imageUrl: string) => {
    console.log('Image captured:', imageUrl);
    toast({
      title: "Image Captured",
      description: "Photo has been captured successfully",
    });
    setShowCamera(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mobile Features Test</h1>
          <p className="text-muted-foreground">
            Test and demo mobile-specific functionality
          </p>
        </div>
        <Badge variant={deviceInfo.isNative ? "default" : "secondary"}>
          {deviceInfo.isNative ? "Native App" : "Web Browser"}
        </Badge>
      </div>

      {/* Mobile Dashboard */}
      <MobileDashboard />

      {/* Feature Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Feature Tests</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Camera Test */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Camera className="w-5 h-5" />
                  <h3 className="font-semibold">Camera Test</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Test camera functionality for taking photos
                </p>
                <Button 
                  onClick={() => setShowCamera(true)} 
                  className="w-full"
                  disabled={!deviceInfo.isNative}
                >
                  Open Camera
                </Button>
                {!deviceInfo.isNative && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Camera only works in mobile app
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Notification Test */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Bell className="w-5 h-5" />
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Test push and local notifications
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={testNotification} 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                  >
                    Test Notification
                  </Button>
                  <Button 
                    onClick={scheduleReminder} 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                  >
                    Schedule Reminder
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Share Test */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Share2 className="w-5 h-5" />
                  <h3 className="font-semibold">Share Feature</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Test native sharing functionality
                </p>
                <MobileShare
                  title="EduManage Test"
                  text="Testing the share feature from EduManage mobile app"
                  url={window.location.href}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full">
                    Test Share
                  </Button>
                </MobileShare>
              </CardContent>
            </Card>

            {/* Device Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Smartphone className="w-5 h-5" />
                  <h3 className="font-semibold">Device Info</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Platform:</span>
                    <span className="font-medium">{deviceInfo.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Native:</span>
                    <span className="font-medium">
                      {deviceInfo.isNative ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        "No"
                      )}
                    </span>
                  </div>
                  {deviceInfo.deviceInfo && (
                    <>
                      <div className="flex justify-between">
                        <span>Model:</span>
                        <span className="font-medium">{deviceInfo.deviceInfo.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>OS:</span>
                        <span className="font-medium">{deviceInfo.deviceInfo.osVersion}</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <MobileCamera
            onImageCapture={handleImageCapture}
            onClose={() => setShowCamera(false)}
            title="Test Camera"
          />
        </div>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">For Web Browser Testing:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Share feature will use Web Share API or copy to clipboard</li>
              <li>• Camera and notifications are disabled</li>
              <li>• Install the PWA for enhanced features</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">For Mobile App Testing:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Camera opens native camera interface</li>
              <li>• Notifications appear as system notifications</li>
              <li>• Share uses native sharing sheet</li>
              <li>• All device features are available</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Build Mobile App:</h4>
            <div className="bg-muted p-3 rounded-lg text-sm font-mono">
              ./build-mobile.sh
            </div>
            <p className="text-sm text-muted-foreground">
              Run this command to build and sync the mobile apps
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}