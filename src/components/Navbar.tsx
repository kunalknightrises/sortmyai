import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, User, Sparkles, Users } from "lucide-react";
import SortMyAILogo from '@/components/ui/SortMyAILogo';
import NeonButton from "@/components/ui/NeonButton";
import ClickEffect from "@/components/ui/ClickEffect";
import { useAuth } from '@/contexts/AuthContext';



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
              <SortMyAILogo className="w-8 h-8 text-sortmy-blue group-hover:scale-110 transition-transform" />
              <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-sortmy-blue animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-white">SortMy</span>
              <span className="text-sortmy-blue">AI</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <Link to="/explore">
            <ClickEffect effect="ripple" color="blue">
              <NeonButton variant="cyan" className="text-sm text-white">
                <Users className="w-4 h-4 mr-2 md:mr-1" />
                <span className="hidden md:inline">Explore Creators</span>
              </NeonButton>
            </ClickEffect>
          </Link>

          {!user ? (
            <>
              <Link to="/login">
                <Button variant="ghost" className="hidden md:flex hover:bg-sortmy-blue/10 text-sm text-white border border-transparent hover:border-sortmy-blue/20 transition-all duration-300">
                  Log In
                </Button>
              </Link>
              <Link to="/signup">
                <ClickEffect effect="ripple" color="blue">
                  <NeonButton variant="gradient" className="text-sm text-white">
                    <User className="w-4 h-4 mr-2 md:mr-1" />
                    <span className="hidden md:inline">Sign Up</span>
                  </NeonButton>
                </ClickEffect>
              </Link>
            </>
          ) : (
            <Link to="/dashboard">
              <ClickEffect effect="ripple" color="blue">
                <NeonButton variant="gradient" className="text-sm text-white">
                  <User className="w-4 h-4 mr-2 md:mr-1" />
                  <span className="hidden md:inline">Command Centre</span>
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
