import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Pages
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Profile from '@/pages/Profile';
import ToolTracker from '@/components/dashboard/ToolTracker';
import AddTool from '@/components/dashboard/AddTool';
import Portfolio from '@/components/dashboard/Portfolio';
import InstagramStylePortfolio from '@/pages/InstagramStylePortfolio';
import Index from '@/pages/Index';
import Dashboard from '@/components/Dashboard';
import Achievements from '@/pages/Achievements';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/portfolio/:username" element={<InstagramStylePortfolio />} />
        
        {/* Dashboard and related routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />        <Route path="/dashboard/profile" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Profile />
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

        <Route path="/dashboard/portfolio" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Portfolio />
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
