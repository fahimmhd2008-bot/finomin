import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AIAdvisoryModal } from './components/AIAdvisoryModal';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DustbinsPage } from './pages/DustbinsPage';
import { FoodWastePage } from './pages/FoodWastePage';
import { WaterPage } from './pages/WaterPage';
import { EnergyPage } from './pages/EnergyPage';
import { RewardsPage } from './pages/RewardsPage';
import { RainwaterPage } from './pages/RainwaterPage';
import { AirQualityPage } from './pages/AirQualityPage';
import { UsersPage } from './pages/UsersPage';
import { getStoredToken, api } from './lib/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5000,
    },
  },
});

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAIPlanOpen, setIsAIPlanOpen] = useState(false);

  // Poll overview for notifications and navbar alerts
  const { data, refetch } = useQuery({
    queryKey: ['telemetry-overview'],
    queryFn: () => api.getTelemetryOverview(),
    refetchInterval: 12000,
  });

  const resolveAlertMutation = useMutation({
    mutationFn: (id: string) => api.resolveAlert(id),
    onSuccess: () => refetch(),
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#080e1a] text-slate-100">
      <Navbar
        onOpenAIPlan={() => setIsAIPlanOpen(true)}
        alerts={data?.alerts || []}
        onResolveAlert={(id) => resolveAlertMutation.mutate(id)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar onOpenAIPlan={() => setIsAIPlanOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <AIAdvisoryModal
        isOpen={isAIPlanOpen}
        onClose={() => setIsAIPlanOpen(false)}
      />
    </div>
  );
};

// Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = getStoredToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout>{children}</AppLayout>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage onOpenAIPlan={() => {}} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dustbins"
            element={
              <ProtectedRoute>
                <DustbinsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/food-waste"
            element={
              <ProtectedRoute>
                <FoodWastePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/water"
            element={
              <ProtectedRoute>
                <WaterPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/energy"
            element={
              <ProtectedRoute>
                <EnergyPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/rewards"
            element={
              <ProtectedRoute>
                <RewardsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/rainwater"
            element={
              <ProtectedRoute>
                <RainwaterPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/air-quality"
            element={
              <ProtectedRoute>
                <AirQualityPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
