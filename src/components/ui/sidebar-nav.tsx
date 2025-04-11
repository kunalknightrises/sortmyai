
import { useLocation } from 'react-router-dom';
import SidebarNavItem from './sidebar-nav-item';
import { 
  LayoutDashboard, 
  MessageSquare, 
  BookOpen, 
  PenTool, 
  User,
  PlusCircle,
  ClipboardList,
  Settings,
  Users,
  Award,
  Trophy
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarNavProps {
  isCollapsed: boolean;
}

const SidebarNav = ({ isCollapsed }: SidebarNavProps) => {
  const location = useLocation();
  const { isAdmin, isIntern } = useAuth();
  
  const commonNavItems = [
    {
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: 'Dashboard'
    },
    {
      href: '/dashboard/tools',
      icon: <MessageSquare className="h-5 w-5" />,
      label: 'Tools'
    },
    {
      href: '/dashboard/portfolio',
      icon: <BookOpen className="h-5 w-5" />,
      label: 'Portfolio'
    },
    {
      href: '/dashboard/achievements',
      icon: <Trophy className="h-5 w-5" />,
      label: 'Achievements'
    },
    {
      href: '/dashboard/profile',
      icon: <User className="h-5 w-5" />,
      label: 'Profile'
    }
  ];

  const adminNavItems = [
    {
      href: '/add-course',
      icon: <PlusCircle className="h-5 w-5" />,
      label: 'Add Course'
    },
    {
      href: '/post-blog',
      icon: <PlusCircle className="h-5 w-5" />,
      label: 'Post Blog'
    },
    {
      href: '/users',
      icon: <Users className="h-5 w-5" />,
      label: 'Manage Users'
    },
    {
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
      label: 'Settings'
    }
  ];

  const internNavItems = [
    {
      href: '/tasks',
      icon: <ClipboardList className="h-5 w-5" />,
      label: 'Tasks'
    }
  ];

  const navigationItems = [
    ...commonNavItems,
    ...(isAdmin ? adminNavItems : []),
    ...(isIntern ? internNavItems : [])
  ];

  return (
    <nav className="flex-1 space-y-1 p-4">
      {navigationItems.map((item) => (
        <SidebarNavItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={item.label}
          active={location.pathname === item.href}
          isCollapsed={isCollapsed}
        />
      ))}
    </nav>
  );
};

export default SidebarNav;
