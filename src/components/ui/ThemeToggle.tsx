import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemeToggleProps {
  className?: string;
}

type Theme = 'light' | 'dark' | 'system';

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isMounted, setIsMounted] = useState(false);
  
  // Initialize theme from localStorage or system preference
  useEffect(() => {
    setIsMounted(true);
    
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      // Check system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
    }
  }, []);
  
  // Update theme when it changes
  useEffect(() => {
    if (!isMounted) return;
    
    const root = document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
    
    localStorage.setItem('theme', theme);
  }, [theme, isMounted]);
  
  // Handle theme change
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };
  
  // If not mounted yet, render nothing to avoid hydration mismatch
  if (!isMounted) {
    return null;
  }
  
  return (
    <div className={cn("flex items-center bg-sortmy-darker/50 backdrop-blur-sm rounded-full p-1", className)}>
      {/* Light mode button */}
      <button
        className={cn(
          "relative rounded-full p-1.5 transition-colors",
          theme === 'light' ? "text-sortmy-blue" : "text-gray-400 hover:text-white"
        )}
        onClick={() => handleThemeChange('light')}
        aria-label="Light mode"
      >
        <Sun className="w-4 h-4" />
        {theme === 'light' && (
          <motion.div
            layoutId="theme-indicator"
            className="absolute inset-0 bg-sortmy-blue/10 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </button>
      
      {/* System preference button */}
      <button
        className={cn(
          "relative rounded-full p-1.5 transition-colors",
          theme === 'system' ? "text-sortmy-blue" : "text-gray-400 hover:text-white"
        )}
        onClick={() => handleThemeChange('system')}
        aria-label="System preference"
      >
        <Monitor className="w-4 h-4" />
        {theme === 'system' && (
          <motion.div
            layoutId="theme-indicator"
            className="absolute inset-0 bg-sortmy-blue/10 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </button>
      
      {/* Dark mode button */}
      <button
        className={cn(
          "relative rounded-full p-1.5 transition-colors",
          theme === 'dark' ? "text-sortmy-blue" : "text-gray-400 hover:text-white"
        )}
        onClick={() => handleThemeChange('dark')}
        aria-label="Dark mode"
      >
        <Moon className="w-4 h-4" />
        {theme === 'dark' && (
          <motion.div
            layoutId="theme-indicator"
            className="absolute inset-0 bg-sortmy-blue/10 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </button>
    </div>
  );
};

export default ThemeToggle;
