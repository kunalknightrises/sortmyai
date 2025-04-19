
import React, { useEffect } from 'react';
import { useBackground } from '@/contexts/BackgroundContext';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  LayoutGrid,
  User,
  Settings,
  Menu,
  X,
  GraduationCap,
  Sparkles,
  Users,
  MessageSquare,
  ImageIcon
} from 'lucide-react';
import SortMyAILogo from './ui/SortMyAILogo';
import { useMessageNotifications } from '@/contexts/MessageNotificationContext';
import NotificationBadge from '@/components/ui/notification-badge';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import AuroraBackground from '@/components/ui/AuroraBackground';


// import GlassCard from '@/components/ui/GlassCard';


interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const sidebarItems = [
    { icon: <LayoutDashboard size={20} />, label: "Command Centre", path: "/dashboard" },
    { icon: <Briefcase size={20} />, label: "Tool Tracker", path: "/dashboard/tools" },
    { icon: <LayoutGrid size={20} />, label: "Portfolio", path: "/dashboard/portfolio" },
    { icon: <Users size={20} />, label: "Explore Creators", path: "/dashboard/explore-creators" },
    { icon: <ImageIcon size={20} />, label: "Explore Posts", path: "/dashboard/explore-posts" },
    { icon: <MessageSquare size={20} />, label: "Messages", path: "/dashboard/messages" },
    { icon: <GraduationCap size={20} />, label: "Academy", path: "/dashboard/academy" },
    { icon: <User size={20} />, label: "Profile", path: "/dashboard/profile" },
    { icon: <Settings size={20} />, label: "Settings", path: "/dashboard/settings" },
  ];

  const SidebarContent = () => {
    const { totalUnreadMessages } = useMessageNotifications();

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center mb-8 py-2">
          <div className="relative">
            <SortMyAILogo className="w-8 h-8 mr-2 text-sortmy-blue" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-sortmy-blue animate-pulse" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">SortMyAI</span>
        </div>

        <div className="flex-1 flex flex-col space-y-1">
          {sidebarItems.map((item, i) => (
            <NavLink
              key={i}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 py-3 px-4 rounded-md transition-all duration-300 relative
                ${isActive
                  ? 'bg-sortmy-blue/10 text-sortmy-blue border-l-2 border-sortmy-blue pl-3 shadow-[0_0_10px_rgba(0,102,255,0.2)] hover:shadow-[0_0_15px_rgba(0,102,255,0.3)]'
                  : 'hover:bg-sortmy-blue/5 text-gray-300 hover:text-white hover:translate-x-1 hover:border-l hover:border-sortmy-blue/30'}
              `}
              onClick={() => isMobile && setIsMenuOpen(false)}
            >
              <div className="relative">
                {item.icon}
                {item.label === 'Messages' && totalUnreadMessages > 0 && (
                  <NotificationBadge count={totalUnreadMessages} />
                )}
              </div>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    );
  };

  // Use the background context
  const { backgroundType, setBackgroundType, setBackgroundIntensity } = useBackground();

  // Adjust background based on the current page
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/dashboard/achievements')) {
      setBackgroundIntensity('high');
    } else if (path.includes('/dashboard/academy') || path.includes('/dashboard/portfolio')) {
      setBackgroundIntensity('medium');
    } else {
      setBackgroundIntensity('low');
    }
  }, [window.location.pathname]);

  return (
    <div className="flex h-screen bg-sortmy-dark text-white overflow-hidden relative">
      {/* Background */}
      {backgroundType === 'aurora' ? (
        <AuroraBackground intensity={50} className="z-0" />
      ) : (
        <div className="fixed inset-0 bg-sortmy-dark z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d001a] to-[#0a0a2e] opacity-80"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        </div>
      )}

      {/* Scanline effect */}
      <div className="scanline-effect z-[1]"></div>

      {/* Mobile Menu Toggle */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="border-r border-sortmy-blue/20 bg-sortmy-darker/70 backdrop-blur-md w-64 flex-shrink-0 p-4 z-10 shadow-[0_0_15px_rgba(0,102,255,0.1)]">
          {/* Subtle scanline effect */}
          <div className="absolute inset-0 pointer-events-none z-[-1] bg-scanline opacity-5"></div>
          <SidebarContent />
        </div>
      )}

      {/* Mobile Sidebar using Sheet component */}
      {isMobile && (
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetContent side="left" className="w-[80%] border-r border-sortmy-blue/20 bg-sortmy-darker/70 backdrop-blur-md p-4 shadow-[0_0_15px_rgba(0,102,255,0.1)]">
            {/* Subtle scanline effect */}
            <div className="absolute inset-0 pointer-events-none z-[-1] bg-scanline opacity-5"></div>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      )}

      {/* Background toggle button at bottom right - moved outside scrollable area */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 bg-sortmy-darker/70 border-sortmy-blue/20"
          onClick={() => setBackgroundType(backgroundType === 'aurora' ? 'simple' : 'aurora')}
          title="Toggle Background Style"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
      </div>

      {/* Main Content with padding adjustment for mobile */}
      <div className={`flex-1 p-4 overflow-y-auto ${isMobile ? 'pt-16' : ''} z-10 relative bg-sortmy-dark/20 backdrop-blur-[2px]`}>

        <div className="max-w-7xl mx-auto relative">
          {/* Subtle scanline effect */}
          <div className="absolute inset-0 pointer-events-none z-[-1] bg-scanline opacity-10"></div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
