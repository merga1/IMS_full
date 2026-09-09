import { useLocation } from "wouter";
import { useAuthStore } from "@/state/auth.store";
import { Search, Moon, Globe, LogOut, User as UserIcon, Settings, PanelLeft, Sun } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

import { useTheme } from "@/app/providers/ThemeProvider";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { NotificationsPopover } from "@/shared/layout/NotificationsPopover";

export function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const [location] = useLocation();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const { setLanguage, t } = useLanguage();

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/': return t('title.dashboard');
      case '/inventory': return t('title.inventory');
      case '/requests': return t('title.requests');
      case '/approvals': return t('title.approvals');
      case '/dispatch': return t('title.dispatch');
      case '/maintenance': return t('title.maintenance');
      case '/hq-dashboard': return t('title.hq');
      case '/admin': return t('title.admin');
      case '/admin/branch-new': return t('title.branch_new');
      case '/admin/hierarchy': return t('title.hierarchy');
      default: return t('title.default');
    }
  };

  return (
    <header className="relative z-40 w-full bg-background border-b border-border/40 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle */}
        <button
          onClick={toggleSidebar}
          className="transition-transform hover:scale-105 active:scale-95 text-foreground hover:text-primary"
        >
          <PanelLeft className="w-4 h-4" strokeWidth={1.5} />
        </button>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            {getPageTitle(location)}
          </h2>
          <div className="flex items-center text-xs text-muted-foreground gap-2 font-medium">
            <span className="flex items-center gap-1">{t('header.hq_branch')}</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString('en-US')}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user?.role === 'STOREKEEPER' && (
          <div className="relative hidden md:block w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets, requests..."
              className="pl-9 h-9 bg-background/50 border-input/50 focus:bg-background transition-colors"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Globe className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('EN')}>English (en)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('AM')}>አማርኛ (am)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('OM')}>Afaan Oromo (om)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('TI')}>ትግርኛ (ti)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('SO')}>Af-Soomaali (so)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('AA')}>Qafaraf (aa)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <NotificationsPopover />

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full ml-2 ring-2 ring-border/50 hover:ring-primary/20 transition-all p-0 overflow-hidden">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.fullName} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{user.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.role.replace('_', ' ')} • {user.branch}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
