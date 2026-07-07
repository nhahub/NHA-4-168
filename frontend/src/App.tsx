import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { routes } from './routes';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { setupAuthInterceptor } from './services/api/axiosInstance';
import { useEffect } from 'react';

const queryClient = new QueryClient();

function AppContent() {
  const { getToken, logout } = useAuth();

  useEffect(() => {
    setupAuthInterceptor(getToken, logout);
  }, [getToken, logout]);

  const router = createBrowserRouter(routes);
  return <RouterProvider router={router} />;
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;