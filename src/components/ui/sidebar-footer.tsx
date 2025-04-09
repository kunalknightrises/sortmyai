import { LogOut } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { getAuth, signOut } from 'firebase/auth';

interface SidebarFooterProps {
  isCollapsed: boolean;
}

const SidebarFooter = ({ isCollapsed }: SidebarFooterProps) => {
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="border-t border-gray-800/50 p-4">
      <Button
        variant="ghost"
        className={cn(
          "w-full text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors",
          isCollapsed ? "justify-center px-0" : "justify-start"
        )}
        onClick={handleLogout}
      >
        <LogOut className="h-5 w-5" />
        {!isCollapsed && <span className="ml-2">Logout</span>}
      </Button>
    </div>
  );
};

export default SidebarFooter;
