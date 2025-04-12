
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  LayoutGrid, 
  User, 
  Settings,
  Brain,
  Menu,
  X,
  GraduationCap
} from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';


interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const sidebarItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/dashboard" },
    { icon: <Briefcase size={20} />, label: "Tool Tracker", path: "/dashboard/tools" },
    { icon: <LayoutGrid size={20} />, label: "Portfolio", path: "/dashboard/portfolio" },
    { icon: <GraduationCap size={20} />, label: "Academy", path: "/dashboard/academy" },
    { icon: <User size={20} />, label: "Profile", path: "/dashboard/profile" },
    { icon: <Settings size={20} />, label: "Settings", path: "/dashboard/settings" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center mb-8 py-2">
        <Brain className="w-8 h-8 mr-2" />
        <span className="text-xl font-bold tracking-tight">SortMyAI</span>
      </div>

      <div className="flex-1 flex flex-col space-y-1">
        {sidebarItems.map((item, i) => (
          <NavLink
            key={i}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 py-3 px-4 rounded-md transition-colors
              ${isActive
                ? 'bg-sortmy-blue/20 text-sortmy-blue'
                : 'hover:bg-sortmy-gray/20 text-gray-300 hover:text-white'}
            `}
            onClick={() => isMobile && setIsMenuOpen(false)}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-sortmy-dark text-white overflow-hidden">
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
        <div className="border-r border-sortmy-gray/30 bg-sortmy-darker w-64 flex-shrink-0 p-4">
          <SidebarContent />
        </div>
      )}

      {/* Mobile Sidebar using Sheet component */}
      {isMobile && (
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetContent side="left" className="w-[80%] border-r border-sortmy-gray/30 bg-sortmy-darker p-4">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      )}

      {/* Main Content with padding adjustment for mobile */}
      <div className={`flex-1 p-4 overflow-y-auto ${isMobile ? 'pt-16' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
