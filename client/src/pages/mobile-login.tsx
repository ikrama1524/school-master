import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useMobile } from "@/hooks/use-mobile";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { 
  GraduationCap, 
  Users, 
  Eye, 
  EyeOff,
  Smartphone,
  Wifi,
  WifiOff
} from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  userType: z.enum(["student", "parent"])
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function MobileLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const deviceInfo = useMobile();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      userType: "student"
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.username, data.password);
      
      // Redirect based on user type
      if (data.userType === "student") {
        setLocation("/student-mobile");
      } else {
        setLocation("/parent-mobile");
      }
      
      toast({
        title: "Welcome!",
        description: `Logged in successfully as ${data.userType}`,
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl">EduManage</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">Student & Parent Portal</p>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <Badge variant={deviceInfo.isNative ? "default" : "secondary"} className="text-xs">
              <Smartphone className="w-3 h-3 mr-1" />
              {deviceInfo.isNative ? "Mobile App" : "Web Browser"}
            </Badge>
            <Badge variant={navigator.onLine ? "default" : "destructive"} className="text-xs">
              {navigator.onLine ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
              {navigator.onLine ? "Online" : "Offline"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* User Type Selection */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={form.watch("userType") === "student" ? "default" : "outline"}
              className="h-auto p-4 flex flex-col space-y-2"
              onClick={() => form.setValue("userType", "student")}
            >
              <GraduationCap className="w-6 h-6" />
              <span className="text-sm">Student</span>
            </Button>
            
            <Button
              type="button"
              variant={form.watch("userType") === "parent" ? "default" : "outline"}
              className="h-auto p-4 flex flex-col space-y-2"
              onClick={() => form.setValue("userType", "parent")}
            >
              <Users className="w-6 h-6" />
              <span className="text-sm">Parent</span>
            </Button>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                {...form.register("username")}
                className="h-12"
              />
              {form.formState.errors.username && (
                <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...form.register("password")}
                  className="h-12 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-12 px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                `Sign In as ${form.watch("userType") === "student" ? "Student" : "Parent"}`
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="space-y-3 pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">Demo Credentials</p>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded text-center">
                <p className="font-medium">Student</p>
                <p>Username: <span className="font-mono">student</span></p>
                <p>Password: <span className="font-mono">student123</span></p>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-950 rounded text-center">
                <p className="font-medium">Parent</p>
                <p>Username: <span className="font-mono">parent</span></p>
                <p>Password: <span className="font-mono">parent123</span></p>
              </div>
            </div>
          </div>

          {/* App Features */}
          <div className="text-center text-xs text-muted-foreground">
            <p>✓ Real-time attendance tracking</p>
            <p>✓ Fee payment reminders</p>
            <p>✓ Instant notifications</p>
            <p>✓ Offline support</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}