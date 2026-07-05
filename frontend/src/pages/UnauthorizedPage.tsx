import { useNavigate } from 'react-router-dom';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h1 className="text-display-lg mb-4">401 - Unauthorized</h1>
      <p className="text-body-md text-on-surface-variant mb-8">You don't have permission to access this resource.</p>
      <button
        onClick={() => navigate('/login')}
        className="px-6 py-2 bg-secondary text-on-secondary rounded-lg hover:opacity-90"
      >
        Go to Login
      </button>
    </div>
  );
}
