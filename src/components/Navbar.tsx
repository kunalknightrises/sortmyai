import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, User, Sparkles, Users } from "lucide-react";
import NeonButton from "@/components/ui/NeonButton";
import ClickEffect from "@/components/ui/ClickEffect";
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8 backdrop-blur-md bg-sortmy-darker/70 border-b border-sortmy-blue/20 shadow-[0_0_15px_rgba(0,102,255,0.1)]">
      {/* Subtle scanline effect */}
      <div className="absolute inset-0 pointer-events-none z-[-1] bg-scanline opacity-5"></div>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <LogoIcon className="w-8 h-8 text-sortmy-blue group-hover:scale-110 transition-transform" />
              <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-sortmy-blue animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#0066ff] to-[#4d94ff] text-transparent bg-clip-text">SortMyAI</span>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <Link to="/explore">
            <ClickEffect effect="ripple" color="blue">
              <NeonButton variant="cyan" className="text-sm">
                <Users className="w-4 h-4 mr-2 md:mr-1" />
                <span className="hidden md:inline">Explore Creators</span>
              </NeonButton>
            </ClickEffect>
          </Link>

          {!user ? (
            <>
              <Link to="/login">
                <Button variant="ghost" className="hidden md:flex hover:bg-sortmy-blue/10 text-sm border border-transparent hover:border-sortmy-blue/20 transition-all duration-300">
                  <span className="bg-gradient-to-r from-sortmy-blue to-[#4d94ff] text-transparent bg-clip-text">Log In</span>
                </Button>
              </Link>
              <Link to="/signup">
                <ClickEffect effect="ripple" color="blue">
                  <NeonButton variant="gradient" className="text-sm">
                    <User className="w-4 h-4 mr-2 md:mr-1" />
                    <span className="hidden md:inline">Sign Up</span>
                  </NeonButton>
                </ClickEffect>
              </Link>
            </>
          ) : (
            <Link to="/dashboard">
              <ClickEffect effect="ripple" color="blue">
                <NeonButton variant="gradient" className="text-sm">
                  <User className="w-4 h-4 mr-2 md:mr-1" />
                  <span className="hidden md:inline">Dashboard</span>
                </NeonButton>
              </ClickEffect>
            </Link>
          )}
          <Button variant="ghost" size="icon" className="md:hidden hover:bg-sortmy-blue/10 border border-transparent hover:border-sortmy-blue/20 transition-all duration-300">
            <Menu className="w-5 h-5 text-sortmy-blue" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
