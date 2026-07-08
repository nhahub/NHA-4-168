import { useAuth } from '../../contexts/AuthContext';

export default function Topbar() {
  const { user } = useAuth();

  // Handle user data with graceful fallbacks
  const firstName = (user as any)?.firstName || user?.email?.split('@')[0] || 'User';
  const lastName = (user as any)?.lastName || '';
  const displayName = `${firstName}${lastName ? ' ' + lastName : ''}`;
  const userRoles = user?.roles?.join(', ') || 'User';
  const avatarChar = firstName.charAt(0).toUpperCase();

  return (
    <div className="bg-surface border-b border-outline flex items-center justify-between px-6 py-4">
      <div>
        <h2 className="text-headline-md text-on-surface">Welcome</h2>
        <p className="text-body-sm text-on-surface-variant">
          {user?.email || 'User'}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-body-md font-semibold text-on-surface">
            {displayName}
          </p>
          <p className="text-body-sm text-on-surface-variant">
            {userRoles}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-on-secondary font-bold">
          {avatarChar}
        </div>
      </div>
    </div>
  );
}
