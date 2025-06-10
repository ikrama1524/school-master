import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TopBarProps {
  onMobileMenuToggle: () => void;
}

export default function TopBar({ onMobileMenuToggle }: TopBarProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const user = {
    name: "John Anderson",
    role: "School Administrator",
    initials: "JA"
  };

  return (
    <header className="bg-card/95 backdrop-blur-md border-b border-border px-4 md:px-6 py-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileMenuToggle}
            className="md:hidden hover:bg-muted/60 transition-all duration-200"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
            <p className="text-sm text-muted-foreground">{currentDate}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative hover:bg-muted/60 transition-all duration-200 hover:scale-105"
          >
            <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center animate-pulse"
            >
              3
            </Badge>
          </Button>
          
          {/* Profile */}
          <div className="flex items-center space-x-3 hover:bg-muted/30 rounded-xl px-3 py-2 transition-all duration-200 cursor-pointer group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground">{user.role}</p>
            </div>
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
              <span className="text-white font-medium">{user.initials}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
