import { Link, useLocation } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  icon: string;
  label: string;
  collapsed?: boolean;
}

export default function NavLink({ to, icon, label, collapsed = false }: NavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
        isActive
          ? 'bg-primary-container text-on-primary-container border-l-4 border-on-primary'
          : 'text-on-primary hover:bg-primary-container/50'
      } ${collapsed ? 'justify-center' : ''}`}
    >
      <span className="text-lg">{icon}</span>
      {!collapsed && <span className="text-body-md">{label}</span>}
    </Link>
  );
}
