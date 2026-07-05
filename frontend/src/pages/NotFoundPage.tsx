import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h1 className="text-display-lg mb-4">404 - Page Not Found</h1>
      <p className="text-body-md text-on-surface-variant mb-8">The page you're looking for doesn't exist.</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-2 bg-secondary text-on-secondary rounded-lg hover:opacity-90"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
