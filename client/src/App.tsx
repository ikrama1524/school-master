import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Students from "@/pages/students";
import Teachers from "@/pages/teachers";
import Attendance from "@/pages/attendance";
import Fees from "@/pages/fees";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Admissions from "@/pages/admissions";
import Payroll from "@/pages/payroll";
import Homework from "@/pages/homework";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import TopBar from "@/components/layout/top-bar";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/students" component={Students} />
      <Route path="/teachers" component={Teachers} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/fees" component={Fees} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route path="/admissions" component={Admissions} />
      <Route path="/payroll" component={Payroll} />
      <Route path="/homework" component={Homework} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex bg-[var(--edu-bg)]">
          <Sidebar />
          <MobileMenu 
            isOpen={isMobileMenuOpen} 
            onClose={() => setIsMobileMenuOpen(false)} 
          />
          
          <main className="flex-1 md:ml-64">
            <TopBar onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
