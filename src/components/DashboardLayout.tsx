
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  LayoutGrid, 
  User, 
  Settings,
  Brain
} from 'lucide-react';


interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user: _user } = useAuth(); 

  const sidebarItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/dashboard" },
    { icon: <Briefcase size={20} />, label: "Tool Tracker", path: "/dashboard/tools" },
    { icon: <LayoutGrid size={20} />, label: "Portfolio", path: "/dashboard/portfolio" },
    { icon: <User size={20} />, label: "Profile", path: "/dashboard/profile" },
    { icon: <Settings size={20} />, label: "Settings", path: "/dashboard/settings" },
  ];

  return (
    <div className="flex h-screen bg-sortmy-dark text-white overflow-hidden">
       {/* Sidebar */}
      <div className="border-r border-sortmy-gray/30 bg-sortmy-darker w-64 flex-shrink-0 p-4">
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
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
