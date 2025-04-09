import { Menu, X } from 'lucide-react';
import { Button } from './button';

interface SidebarMobileMenuProps {
  isMobileOpen: boolean;
  toggleMobileOpen: () => void;
}

const SidebarMobileMenu = ({ isMobileOpen, toggleMobileOpen }: SidebarMobileMenuProps) => {
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed right-4 top-4 z-50"
        onClick={toggleMobileOpen}
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
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
