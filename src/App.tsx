import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Profile from '@/pages/Profile';
import ToolTracker from '@/components/dashboard/ToolTracker';
import AddTool from '@/components/dashboard/AddTool';
import Portfolio from '@/components/dashboard/Portfolio';
import InstagramStylePortfolio from '@/pages/InstagramStylePortfolio';
import Dashboard from '@/components/Dashboard';

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
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/portfolio/:username" element={<InstagramStylePortfolio />} />

        {/* Protected dashboard routes */}
        <Route path="/dashboard" element={<ProtectedRoute>
          <DashboardLayout>
            <div>
              
            </div>
          </DashboardLayout>
        </ProtectedRoute>}>


          <Route index element={<DashboardLayout>
            <Dashboard />
          </DashboardLayout>} />
           <Route path="profile" element={<DashboardLayout>
            <Profile />
          </DashboardLayout>} />
          <Route path="tools" element={<DashboardLayout><ToolTracker /></DashboardLayout>} />
          <Route path="tools/add" element={<DashboardLayout><AddTool /></DashboardLayout>} />
          <Route path="portfolio" element={<DashboardLayout><Portfolio /></DashboardLayout>} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {/* <ToastProvider /> */}
    </QueryClientProvider>
  );
}

export default App;