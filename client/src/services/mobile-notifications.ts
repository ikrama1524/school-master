import { Capacitor } from '@capacitor/core';
import { 
  PushNotifications, 
  PushNotificationSchema, 
  ActionPerformed,
  Token 
} from '@capacitor/push-notifications';
import { 
  LocalNotifications, 
  LocalNotificationSchema 
} from '@capacitor/local-notifications';

export class MobileNotificationService {
  private static instance: MobileNotificationService;
  private isInitialized = false;

  static getInstance(): MobileNotificationService {
    if (!MobileNotificationService.instance) {
      MobileNotificationService.instance = new MobileNotificationService();
    }
    return MobileNotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform() || this.isInitialized) {
      return;
    }

    try {
      // Request permission for push notifications
      const permStatus = await PushNotifications.requestPermissions();
      
      if (permStatus.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register();

        // Add listeners
        PushNotifications.addListener('registration', (token: Token) => {
          console.info('Registration token: ', token.value);
          // Send token to your server
          this.sendTokenToServer(token.value);
        });

        PushNotifications.addListener('registrationError', (err) => {
          console.error('Registration error: ', err.error);
        });

        PushNotifications.addListener(
          'pushNotificationReceived',
          (notification: PushNotificationSchema) => {
            console.log('Push notification received: ', notification);
            // Handle received notification
            this.handleReceivedNotification(notification);
          }
        );

        PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (notification: ActionPerformed) => {
            console.log('Push notification action performed', notification);
            // Handle notification tap
            this.handleNotificationAction(notification);
          }
        );
      }

      // Request permission for local notifications
      const localPermStatus = await LocalNotifications.requestPermissions();
      
      if (localPermStatus.display === 'granted') {
        LocalNotifications.addListener(
          'localNotificationReceived',
          (notification: LocalNotificationSchema) => {
            console.log('Local notification received: ', notification);
          }
        );

        LocalNotifications.addListener(
          'localNotificationActionPerformed',
          (notification: ActionPerformed) => {
            console.log('Local notification action performed', notification);
            this.handleNotificationAction(notification);
          }
        );
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  private async sendTokenToServer(token: string): Promise<void> {
    try {
      // Send the FCM token to your backend
      const response = await fetch('/api/notifications/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ fcmToken: token }),
      });

      if (response.ok) {
        console.log('Token registered successfully');
      }
    } catch (error) {
      console.error('Error sending token to server:', error);
    }
  }

  private handleReceivedNotification(notification: PushNotificationSchema): void {
    // Handle notification received while app is in foreground
    // You can show a local notification or update UI
    if (notification.title && notification.body) {
      this.showLocalNotification(notification.title, notification.body);
    }
  }

  private handleNotificationAction(notification: ActionPerformed): void {
    // Handle notification tap - navigate to relevant screen
    const data = notification.notification.data;
    
    if (data?.type) {
      switch (data.type) {
        case 'fee_reminder':
          window.location.href = '/fees';
          break;
        case 'attendance_alert':
          window.location.href = '/attendance';
          break;
        case 'homework_assigned':
          window.location.href = '/homework';
          break;
        case 'result_published':
          window.location.href = '/results';
          break;
        default:
          window.location.href = '/';
      }
    }
  }

  async showLocalNotification(title: string, body: string, data?: any): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            data,
            schedule: { at: new Date(Date.now() + 1000) }, // Show after 1 second
          },
        ],
      });
    } catch (error) {
      console.error('Error showing local notification:', error);
    }
  }

  // Schedule notification for fee reminders, homework deadlines, etc.
  async scheduleNotification(
    title: string, 
    body: string, 
    scheduleDate: Date, 
    data?: any
  ): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            data,
            schedule: { at: scheduleDate },
          },
        ],
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  // Cancel all pending notifications
  async cancelAllNotifications(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await LocalNotifications.cancel({ notifications: [] });
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }
}