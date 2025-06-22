import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import NotFound from "@/pages/not-found";
import Students from "@/pages/students";
import Calendar from "@/pages/calendar";
import { RoleBasedSidebar } from "@/components/layout/role-based-sidebar";
import { RoleBasedDashboard } from "@/components/dashboards/role-based-dashboard";
import { useAuth } from "@/hooks/useAuth";
import { hasModuleAccess } from "@shared/roles";

function ProtectedRoute({ children, module }: { children: React.ReactNode; module: string }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">Please log in to access this module.</p>
        </div>
      </div>
    );
  }

  if (!hasModuleAccess(user.role, module as any)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to access this module.</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

function AuthenticatedRouter() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <RoleBasedSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Switch>
            <Route path="/" component={() => <RoleBasedDashboard />} />
            <Route 
              path="/students" 
              component={() => (
                <ProtectedRoute module="students">
                  <Students />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/teachers" 
              component={() => (
                <ProtectedRoute module="teachers">
                  <Teachers />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/attendance" 
              component={() => (
                <ProtectedRoute module="attendance">
                  <Attendance />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/timetable" 
              component={() => (
                <ProtectedRoute module="timetable">
                  <Timetable />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/homework" 
              component={() => (
                <ProtectedRoute module="homework">
                  <Homework />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/results" 
              component={() => (
                <ProtectedRoute module="results">
                  <Results />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/reports" 
              component={() => (
                <ProtectedRoute module="reports">
                  <Reports />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/fees" 
              component={() => (
                <ProtectedRoute module="fees">
                  <Fees />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/payroll" 
              component={() => (
                <ProtectedRoute module="payroll">
                  <Payroll />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/calendar" 
              component={() => (
                <ProtectedRoute module="calendar">
                  <Calendar />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/settings" 
              component={() => (
                <ProtectedRoute module="settings">
                  <Settings />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/documents" 
              component={() => (
                <ProtectedRoute module="documents">
                  <Documents />
                </ProtectedRoute>
              )} 
            />
            <Route 
              path="/admissions" 
              component={() => (
                <ProtectedRoute module="admissions">
                  <Admissions />
                </ProtectedRoute>
              )} 
            />
            <Route component={NotFound} />
          </Switch>
        </div>
      </main>
    </div>
  );
}

function AppContent() {
  try {
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

    return <AuthenticatedRouter />;
  } catch (error) {
    console.error('AppContent error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-4">Please refresh the page or clear your browser data.</p>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reset Application
          </button>
        </div>
      </div>
    );
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;