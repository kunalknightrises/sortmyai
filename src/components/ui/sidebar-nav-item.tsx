import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  isCollapsed: boolean;
}

const SidebarNavItem = ({ href, icon, label, active, isCollapsed }: NavItemProps) => {
  const itemVariants = {
    expanded: { width: "auto" },
    collapsed: { width: "3rem" }
  };

  return (
    <motion.div
      variants={itemVariants}
      transition={{ duration: 0.2 }}
      initial={false}
    >
      <Link
        to={href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white hover:bg-gray-800/50',
          active && 'bg-gray-800/80 text-white backdrop-blur-sm',
          isCollapsed ? 'justify-center' : ''
        )}
        title={isCollapsed ? label : undefined}
      >
        <div className="w-5 h-5">{icon}</div>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="truncate"
          >
            {label}
          </motion.span>
        )}
      </Link>
    </motion.div>
  );
};

export default SidebarNavItem;
