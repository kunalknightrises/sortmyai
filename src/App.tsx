import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import PushNotificationInitializer from './components/PushNotificationInitializer';
import PortfolioProvider from './contexts/PortfolioContext';
import BackgroundProvider from './contexts/BackgroundContext';

// Pages
import Login from '@/pages/Login';
import SimpleLogin from '@/pages/SimpleLogin';
import EmailLogin from '@/pages/EmailLogin';
import Signup from '@/pages/Signup';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import ToolTracker from '@/components/dashboard/ToolTracker';
import AddTool from '@/components/dashboard/AddTool';
import AIToolsLibrary from '@/components/dashboard/AIToolsLibrary';
import Portfolio from '@/components/dashboard/Portfolio';
import AddPortfolio from '@/components/dashboard/AddPortfolio';
import ExploreCreators from '@/components/dashboard/ExploreCreators';
import InstagramStylePortfolio from '@/pages/InstagramStylePortfolio';
import Index from '@/pages/Index';
import Dashboard from '@/components/Dashboard';
import Achievements from '@/pages/Achievements';
import { useEffect } from 'react';
import Academy from '@/pages/Academy';
import AIToolsUpload from '@/pages/AIToolsUpload';
import SynthwaveDemo from '@/pages/SynthwaveDemo';
import Messages from '@/pages/Messages';
import UserInteractions from '@/pages/UserInteractions';
import Analytics from '@/pages/Analytics';
import { initializeCapacitor } from '@/lib/capacitor';
import '@/lib/debug-utils'; // Import debug utilities

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  // Initialize Capacitor when the app starts
  useEffect(() => {
    initializeCapacitor().catch(console.error);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BackgroundProvider>
        <PortfolioProvider>
          <PushNotificationInitializer />
          <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<EmailLogin />} />
        <Route path="/popup-login" element={<SimpleLogin />} />
        <Route path="/old-login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/portfolio/:username" element={<InstagramStylePortfolio />} />
        <Route path="/explore" element={<ExploreCreators />} />

        {/* Dashboard and related routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/profile" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/settings" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/tools" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ToolTracker />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/tools/add" element={
          <ProtectedRoute>
            <DashboardLayout>
              <AddTool />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/tools/library" element={
          <ProtectedRoute>
            <DashboardLayout>
              <AIToolsLibrary />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/portfolio" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Portfolio />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/portfolio/:username" element={
          <Portfolio />
        } />

        <Route path="/dashboard/portfolio/add" element={
          <ProtectedRoute>
            <DashboardLayout>
              <AddPortfolio />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/explore-creators" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ExploreCreators />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/achievements" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Achievements />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* New Academy route */}
        <Route path="/dashboard/academy" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Academy />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* AI Tools Upload route - Admin only */}
        <Route path="/dashboard/ai-tools-upload" element={
          <ProtectedRoute>
            <DashboardLayout>
              <AIToolsUpload />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Messages route */}
        <Route path="/dashboard/messages" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Messages />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* User Interactions route */}
        <Route path="/dashboard/interactions" element={
          <ProtectedRoute>
            <DashboardLayout>
              <UserInteractions />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Analytics route */}
        <Route path="/dashboard/analytics" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Analytics />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Synthwave UI Demo route */}
        <Route path="/synthwave-demo" element={<SynthwaveDemo />} />

        <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PortfolioProvider>
      </BackgroundProvider>
    </QueryClientProvider>
  );
}

export default App;
