import React from 'react';
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8 backdrop-blur-md bg-sortmy-darker/80 border-b border-sortmy-gray/30">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <LogoIcon className="w-8 h-8 mr-2" />
          <span className="text-xl font-bold tracking-tight">SortMyAI</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <NavLinks />
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="hidden md:flex hover:bg-sortmy-blue/10">
            Log In
          </Button>
          <Button className="bg-sortmy-blue hover:bg-sortmy-blue/90 text-white">
            Join Waitlist
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

const NavLinks = () => {
  return (
    <>
      <a href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">Features</a>
      <a href="#audience" className="text-sm text-gray-300 hover:text-white transition-colors">Who It's For</a>
      <a href="#how-it-works" className="text-sm text-gray-300 hover:text-white transition-colors">How It Works</a>
      <a href="#comparison" className="text-sm text-gray-300 hover:text-white transition-colors">Why It's Different</a>
    </>
  );
};

const LogoIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="12" cy="12" r="10" stroke="#0EA5E9" strokeWidth="1.5" />
    <path d="M8 10C8 8.89543 8.89543 8 10 8H14C15.1046 8 16 8.89543 16 10V14C16 15.1046 15.1046 16 14 16H10C8.89543 16 8 15.1046 8 14V10Z" fill="#0EA5E9" />
    <path d="M11 7V17" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 11H17" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default Navbar;
