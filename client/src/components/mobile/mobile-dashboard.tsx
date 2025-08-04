import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMobile, useKeyboard } from '@/hooks/use-mobile';
import MobileShare from './mobile-share';
import { 
  Smartphone, 
  Camera, 
  Bell, 
  Wifi, 
  WifiOff, 
  Battery,
  Share2,
  Download
} from 'lucide-react';

export default function MobileDashboard() {
  const deviceInfo = useMobile();
  const { isKeyboardOpen, keyboardHeight } = useKeyboard();

  if (!deviceInfo.isNative) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5" />
            <span>Mobile Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">Mobile App Features</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Install the mobile app to access advanced features like camera, push notifications, and offline support.
            </p>
            <Badge variant="outline">Web Version</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Device Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5" />
            <span>Mobile Device</span>
            <Badge variant="default" className="ml-auto">Native App</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Platform:</span>
              <div className="font-medium capitalize">{deviceInfo.platform}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Device:</span>
              <div className="font-medium">{deviceInfo.deviceInfo?.model || 'Unknown'}</div>
            </div>
            <div>
              <span className="text-muted-foreground">OS Version:</span>
              <div className="font-medium">{deviceInfo.deviceInfo?.osVersion || 'Unknown'}</div>
            </div>
            <div>
              <span className="text-muted-foreground">App Version:</span>
              <div className="font-medium">1.0.0</div>
            </div>
          </div>
          
          {isKeyboardOpen && (
            <div className="p-2 bg-blue-50 rounded-lg text-sm text-blue-700">
              Keyboard active (height: {keyboardHeight}px)
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Features Card */}
      <Card>
        <CardHeader>
          <CardTitle>Mobile Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
              <Camera className="w-6 h-6" />
              <span className="text-xs">Camera</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
              <Bell className="w-6 h-6" />
              <span className="text-xs">Notifications</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
              {navigator.onLine ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
              <span className="text-xs">{navigator.onLine ? 'Online' : 'Offline'}</span>
            </Button>
            
            <MobileShare
              title="EduManage App"
              text="Check out this amazing school management app!"
              className="h-auto p-4 flex flex-col space-y-2 border rounded-lg cursor-pointer hover:bg-muted/50"
            >
              <Share2 className="w-6 h-6" />
              <span className="text-xs">Share App</span>
            </MobileShare>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start">
            <Camera className="w-4 h-4 mr-2" />
            Scan Student ID
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <Bell className="w-4 h-4 mr-2" />
            Send Notification
          </Button>
          
          <MobileShare
            title="Attendance Report"
            text="Today's attendance has been updated. Check the EduManage app for details."
            className="w-full"
          >
            <Button variant="outline" className="w-full justify-start">
              <Share2 className="w-4 h-4 mr-2" />
              Share Report
            </Button>
          </MobileShare>
        </CardContent>
      </Card>

      {/* Status Indicators */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Server Connection</span>
              <Badge variant={navigator.onLine ? "default" : "destructive"}>
                {navigator.onLine ? "Connected" : "Offline"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Data Sync</span>
              <Badge variant="default">Up to date</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Notifications</span>
              <Badge variant="outline">Enabled</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Cache Status</span>
              <Badge variant="secondary">Ready</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}