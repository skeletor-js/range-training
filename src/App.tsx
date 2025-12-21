import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, CalendarDays, Package, Settings as SettingsIcon } from 'lucide-react';
import { initializeDatabase } from '@/db';
import { Settings } from '@/pages/Settings';
import { Inventory } from '@/pages/Inventory';
import { Capture } from '@/pages/Capture';
import { Home } from '@/pages/Home';
import { Sessions } from '@/pages/Sessions';
import { cn } from '@/lib/utils';


function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Home' },
    { path: '/sessions', icon: CalendarDays, label: 'Sessions' },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full gap-1 text-xs transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function AppContent() {
  const location = useLocation();

  // Full-screen routes without navigation
  if (location.pathname === '/capture') {
    return (
      <Routes>
        <Route path="/capture" element={<Capture />} />
      </Routes>
    );
  }

  return (
    <>
      <main className="pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <Navigation />
    </>
  );
}

function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await initializeDatabase();
        setIsReady(true);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError((err as Error).message || 'Failed to initialize database');
      }
    }
    init();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-destructive mb-2">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
