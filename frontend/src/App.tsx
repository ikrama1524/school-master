
import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import Router from './Router';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import MobileDrawer from './components/layout/MobileDrawer';
import { useAuth } from './contexts/AuthContext';

function AppLayout() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    return <Router />;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <MobileDrawer isOpen={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-auto">
          <Router />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </QueryClientProvider>
  );
}
