import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, CalendarDays, Package, Settings as SettingsIcon, Target } from 'lucide-react';
import { initializeDatabase } from '@/db';
import { useSettingsStore } from '@/stores/settingsStore';
import { UpdateNotification, NetworkStatus } from '@/components/pwa';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';
import { applyTheme, getPresetTheme } from '@/lib/themeUtils';

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('@/pages/Home').then(m => ({ default: m.Home })));
const Sessions = lazy(() => import('@/pages/Sessions').then(m => ({ default: m.Sessions })));
const Training = lazy(() => import('@/pages/Training').then(m => ({ default: m.Training })));
const DrillDetail = lazy(() => import('@/pages/DrillDetail').then(m => ({ default: m.DrillDetail })));
const Inventory = lazy(() => import('@/pages/Inventory').then(m => ({ default: m.Inventory })));
const Settings = lazy(() => import('@/pages/Settings').then(m => ({ default: m.Settings })));
const Capture = lazy(() => import('@/pages/Capture').then(m => ({ default: m.Capture })));
const SessionDetail = lazy(() => import('@/pages/SessionDetail').then(m => ({ default: m.SessionDetail })));


function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Home' },
    { path: '/sessions', icon: CalendarDays, label: 'Sessions' },
    { path: '/training', icon: Target, label: 'Training' },
    { path: '/inventory', icon: Package, label: 'Armory' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-inset-bottom">
      <div className="absolute -top-6 left-4">
        <NetworkStatus />
      </div>
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ path, icon: Icon, label }) => {
          // Check if current path matches or starts with the nav path (for nested routes)
          const isActive =
            location.pathname === path ||
            (path === '/training' && location.pathname.startsWith('/drills')) ||
            (path === '/sessions' && location.pathname.startsWith('/sessions/'));
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
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/capture" element={<Capture />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <>
      <main className="pb-20">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/sessions/:id" element={<SessionDetail />} />
            <Route path="/training" element={<Training />} />
            <Route path="/drills/:id" element={<DrillDetail />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </main>
      <Navigation />
    </>
  );
}

function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const highGlareMode = useSettingsStore((state) => state.highGlareMode);
  const currentTheme = useSettingsStore((state) => state.currentTheme);
  const customTheme = useSettingsStore((state) => state.customTheme);

  // Apply high-glare mode class to document
  useEffect(() => {
    document.documentElement.classList.toggle('high-glare', highGlareMode);
  }, [highGlareMode]);

  // Apply theme to document
  useEffect(() => {
    if (currentTheme === 'Custom' && customTheme) {
      applyTheme(customTheme);
    } else {
      const presetTheme = getPresetTheme(currentTheme);
      if (presetTheme) {
        applyTheme(presetTheme);
      }
    }
  }, [currentTheme, customTheme]);

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
    return <LoadingSpinner />;
  }

  return (
    <BrowserRouter>
      <AppContent />
      <UpdateNotification />
    </BrowserRouter>
  );
}

export default App;
