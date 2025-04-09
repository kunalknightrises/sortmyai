import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion } from 'framer-motion';
import SidebarHeader from './sidebar-header';
import SidebarNav from './sidebar-nav';
import SidebarFooter from './sidebar-footer';
import SidebarMobileMenu from './sidebar-mobile-menu';

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleCollapsed = () => setIsCollapsed(!isCollapsed);
  const toggleMobileOpen = () => setIsMobileOpen(!isMobileOpen);

  const sidebarVariants = {
    expanded: { width: "16rem" },
    collapsed: { width: "4rem" }
  };

  return (
    <>
      <SidebarMobileMenu 
        isMobileOpen={isMobileOpen} 
        toggleMobileOpen={toggleMobileOpen} 
      />

      <motion.div
        variants={sidebarVariants}
        animate={isCollapsed ? "collapsed" : "expanded"}
        transition={{ duration: 0.2 }}
        className={cn(
          'fixed top-0 left-0 z-40 h-full bg-gray-900/50 border-r border-gray-800/50 backdrop-blur-xl transition-transform lg:translate-x-0',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <SidebarHeader 
            isCollapsed={isCollapsed} 
            toggleCollapsed={toggleCollapsed} 
          />

          <SidebarNav isCollapsed={isCollapsed} />

          <SidebarFooter isCollapsed={isCollapsed} />
        </div>
      </motion.div>
    </>
  );
};
