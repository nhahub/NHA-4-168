import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { routes } from './routes';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { setupAuthInterceptor } from './services/api/axiosInstance';
import { useEffect } from 'react';

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
      <AppContent />
    </AuthProvider>
  );
}

export default App;
