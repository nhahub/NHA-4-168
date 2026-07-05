import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1">
        {/* Topbar */}
        <Topbar />

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
