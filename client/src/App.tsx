import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Timetable from "@/pages/timetable";
import Teachers from "@/pages/teachers";
import Attendance from "@/pages/attendance";
import Fees from "@/pages/fees";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Admissions from "@/pages/admissions";
import Documents from "@/pages/documents-simple";
import Payroll from "@/pages/payroll";
import Homework from "@/pages/homework";
import Results from "@/pages/results";
import Students from "@/pages/students";
import Users from "@/pages/users";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import TopBar from "@/components/layout/top-bar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

function AuthenticatedRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route component={Login} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/admissions" component={Admissions} />
      <Route path="/calendar" component={Timetable} />
      <Route path="/teachers" component={Teachers} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/fees" component={Fees} />
      <Route path="/reports" component={Reports} />
      <Route path="/settings" component={Settings} />
      <Route path="/payroll" component={Payroll} />
      <Route path="/homework" component={Homework} />
      <Route path="/results" component={Results} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route component={Login} />
      </Switch>
    );
  }

  return (
    <div className="min-h-screen flex bg-[var(--edu-bg)]">
      <Sidebar />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      <main className="flex-1 md:ml-64">
        <TopBar onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
        <div className="p-4 md:p-6">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/students" component={Students} />
            <Route path="/admissions" component={Admissions} />
            <Route path="/documents" component={Documents} />
            <Route path="/calendar" component={Timetable} />
            <Route path="/teachers" component={Teachers} />
            <Route path="/attendance" component={Attendance} />
            <Route path="/fees" component={Fees} />
            <Route path="/reports" component={Reports} />
            <Route path="/settings" component={Settings} />
            <Route path="/payroll" component={Payroll} />
            <Route path="/homework" component={Homework} />
            <Route path="/results" component={Results} />
            <Route path="/users" component={Users} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
