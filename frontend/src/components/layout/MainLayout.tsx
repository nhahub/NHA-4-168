import { useState } from 'react';
import type { ReactNode } from 'react';
import Sidebar from '../Sidebar';
import Searchbar from '../Searchbar';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-svh bg-background text-on-surface">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Searchbar
        query={searchQuery}
        onQueryChange={setSearchQuery}
        onMenuClick={() => setSidebarOpen(true)}
      />
      <main className="lg:pl-[280px]">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}