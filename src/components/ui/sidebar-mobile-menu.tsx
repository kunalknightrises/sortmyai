
import { Menu, X } from 'lucide-react';
import { Button } from './button';
import { useIsNative } from '@/hooks/use-mobile';

interface SidebarMobileMenuProps {
  isMobileOpen: boolean;
  toggleMobileOpen: () => void;
}

const SidebarMobileMenu = ({ isMobileOpen, toggleMobileOpen }: SidebarMobileMenuProps) => {
  const isNative = useIsNative();
  
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={`lg:hidden fixed right-4 top-4 z-50 ${isNative ? 'h-12 w-12' : ''}`}
        onClick={toggleMobileOpen}
      >
        {isMobileOpen ? (
          <X className={`${isNative ? 'h-6 w-6' : 'h-5 w-5'}`} />
        ) : (
          <Menu className={`${isNative ? 'h-6 w-6' : 'h-5 w-5'}`} />
        )}
      </Button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={toggleMobileOpen}
        />
      )}
    </>
  );
};

export default SidebarMobileMenu;
