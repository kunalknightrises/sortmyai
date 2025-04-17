
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Brain,
  LayoutGrid,
  Briefcase,
  Award,
  User,
  Settings,
  GraduationCap,
  Upload,
  ShieldCheck,
  Users,
  Heart,
  BarChart2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = () => {
  const { isAdmin } = useAuth();

  const sidebarItems = [
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <LayoutGrid size={20} />,
      label: "Portfolio",
      path: "/dashboard/portfolio",
    },
    {
      icon: <Users size={20} />,
      label: "Explore Creators",
      path: "/dashboard/explore-creators",
    },
    {
      icon: <GraduationCap size={20} />,
      label: "Academy",
      path: "/dashboard/academy",
    },
    {
      icon: <Briefcase size={20} />,
      label: "Tool Tracker",
      path: "/dashboard/tools",
    },
    {
      icon: <Award size={20} />,
      label: "Achievements",
      path: "/dashboard/achievements",
    },
    {
      icon: <Heart size={20} />,
      label: "My Interactions",
      path: "/dashboard/interactions",
    },
    {
      icon: <BarChart2 size={20} />,
      label: "Analytics",
      path: "/dashboard/analytics",
    },
    {
      icon: <User size={20} />,
      label: "Profile",
      path: "/dashboard/profile",
    },
    {
      icon: <Settings size={20} />,
      label: "Settings",
      path: "/dashboard/settings",
    },
    // Admin-only menu item
    ...(isAdmin ? [
      {
        icon: <Upload size={20} />,
        label: "AI Tools Upload",
        path: "/dashboard/ai-tools-upload",
        adminBadge: true
      }
    ] : [])
  ];

  return (
    <div className="border-r border-sortmy-gray/30 bg-sortmy-darker w-64 flex-shrink-0 p-4 h-screen">
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
            <div className="flex items-center gap-3 flex-1">
              {item.icon}
              <span>{item.label}</span>
            </div>
            {item.adminBadge && (
              <div className="bg-red-500/20 text-red-400 text-xs px-1.5 py-0.5 rounded flex items-center">
                <ShieldCheck size={10} className="mr-1" />
                Admin
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
