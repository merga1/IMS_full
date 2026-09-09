import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

// ... imports

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSidebarToggle = () => {
    if (window.innerWidth >= 768) {
      setCollapsed(!collapsed);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">

      {/* Sidebar (Full Height, Left) */}
      <Sidebar collapsed={collapsed} mobileOpen={sidebarOpen} />

      {/* Main Content Area (Right) */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Offline Banner */}
        {isOffline && (
          <div className="bg-destructive text-destructive-foreground text-center py-1 text-sm font-medium flex items-center justify-center gap-2 shadow-md">
            <WifiOff className="w-4 h-4" />
            Offline Mode: Changes will sync when connection is restored.
          </div>
        )}

        {/* Navbar (Spans Content Area) */}
        <Header toggleSidebar={handleSidebarToggle} />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto scroll-smooth p-6">
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
