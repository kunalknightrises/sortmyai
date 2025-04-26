import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, User } from "lucide-react";

const LogoIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/>
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/>
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396"/>
    <path d="M19.938 10.5a4 4 0 0 1 .585.396"/>
    <path d="M6 18a4 4 0 0 1-1.967-.516"/>
    <path d="M19.967 17.484A4 4 0 0 1 18 18"/>
  </svg>
);

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8 backdrop-blur-md bg-sortmy-darker/80 border-b border-sortmy-gray/30">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <LogoIcon className="w-8 h-8 text-sortmy-blue group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold tracking-tight">SortMyAI</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link to="/explore">
            <Button variant="ghost" className="hidden md:flex hover:bg-sortmy-blue/10 text-sm">
              Explore Creators
            </Button>
          </Link>

          <Link to="/login">
            <Button variant="ghost" className="hidden md:flex hover:bg-sortmy-blue/10 text-sm">
              Log In
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-sortmy-blue hover:bg-sortmy-blue/90 text-white text-sm">
              <User className="w-4 h-4 mr-2 md:mr-1" />
              <span className="hidden md:inline">Sign Up</span>
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
