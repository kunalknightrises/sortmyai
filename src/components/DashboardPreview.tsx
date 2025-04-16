import { CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Lock, Star, TrendingUp, Sparkles } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import NeonButton from "@/components/ui/NeonButton";

const LogoIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
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

const DashboardPreview = () => {
  return (
    <div className="relative rounded-xl overflow-hidden border border-sortmy-blue/20 shadow-[0_0_20px_rgba(0,102,255,0.15)] backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-sortmy-dark pointer-events-none z-10" />
      {/* Subtle scanline effect */}
      <div className="absolute inset-0 pointer-events-none z-[1] bg-scanline opacity-10"></div>

      <div className="bg-sortmy-darker/70 p-4 border-b border-sortmy-blue/20 flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <LogoIcon className="w-5 h-5 text-sortmy-blue" />
            <Sparkles className="w-2 h-2 absolute -top-1 -right-1 text-sortmy-blue animate-pulse" />
          </div>
          <h3 className="text-sm font-medium bg-gradient-to-r from-[#0066ff] to-[#4d94ff] text-transparent bg-clip-text">My AI Command Center</h3>
        </div>
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-sortmy-gray/50"></div>
          <div className="w-3 h-3 rounded-full bg-sortmy-gray/50"></div>
          <div className="w-3 h-3 rounded-full bg-sortmy-gray/50"></div>
        </div>
      </div>

      <div className="p-6 max-h-[400px] overflow-hidden bg-sortmy-darker/50 backdrop-blur-sm">
        <GlassCard variant="bordered" className="border-sortmy-blue/20 mb-6">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-sortmy-blue" />
              <span className="bg-gradient-to-r from-[#0066ff] to-[#4d94ff] text-transparent bg-clip-text">AI Tool Performance</span>
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-sortmy-blue/5 p-3 rounded-lg border border-sortmy-blue/10 hover:border-sortmy-blue/30 transition-all duration-300 hover:bg-sortmy-blue/10">
                <div className="text-xs text-gray-400">Tools Tracked</div>
                <div className="text-xl font-bold bg-gradient-to-r from-[#0066ff] to-[#4d94ff] text-transparent bg-clip-text">24</div>
              </div>
              <div className="bg-sortmy-blue/5 p-3 rounded-lg border border-sortmy-blue/10 hover:border-sortmy-blue/30 transition-all duration-300 hover:bg-sortmy-blue/10">
                <div className="text-xs text-gray-400">Use Cases</div>
                <div className="text-xl font-bold bg-gradient-to-r from-[#0066ff] to-[#4d94ff] text-transparent bg-clip-text">86</div>
              </div>
              <div className="bg-sortmy-blue/5 p-3 rounded-lg border border-sortmy-blue/10 hover:border-sortmy-blue/30 transition-all duration-300 hover:bg-sortmy-blue/10">
                <div className="text-xs text-gray-400">Better Options</div>
                <div className="text-xl font-bold bg-gradient-to-r from-[#0066ff] to-[#4d94ff] text-transparent bg-clip-text">
                  12
                  <span className="text-xs ml-1 text-[#00ffff]">+3</span>
                </div>
              </div>
            </div>
          </CardContent>
        </GlassCard>

        <h4 className="text-sm font-medium mb-3 bg-gradient-to-r from-[#0066ff] to-[#4d94ff] text-transparent bg-clip-text inline-block">Tool Tracker</h4>
        <Table className="backdrop-blur-sm">
          <TableHeader>
            <TableRow className="border-sortmy-blue/20">
              <TableHead className="text-xs">Tool</TableHead>
              <TableHead className="text-xs">Use Case</TableHead>
              <TableHead className="text-xs">
                <div className="flex items-center">
                  Better Alternative
                  <Lock className="w-3 h-3 ml-1 text-sortmy-blue" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="border-sortmy-blue/20 hover:bg-sortmy-blue/5 transition-colors duration-300">
              <TableCell className="py-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded bg-sortmy-blue/20 mr-2 border border-sortmy-blue/30"></div>
                  <span>ChatGPT</span>
                </div>
              </TableCell>
              <TableCell className="py-2">Writing content, research</TableCell>
              <TableCell className="py-2 relative">
                <div className="filter blur-sm">Claude Opus</div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <NeonButton size="sm" variant="cyan" className="text-xs h-7 px-2">
                    <Star className="w-3 h-3 mr-1" /> Unlock with Plus
                  </NeonButton>
                </div>
              </TableCell>
            </TableRow>
            <TableRow className="border-sortmy-blue/20 hover:bg-sortmy-blue/5 transition-colors duration-300">
              <TableCell className="py-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded bg-sortmy-blue/20 mr-2 border border-sortmy-blue/30"></div>
                  <span>Midjourney</span>
                </div>
              </TableCell>
              <TableCell className="py-2">Image generation</TableCell>
              <TableCell className="py-2 relative">
                <div className="filter blur-sm">Dall-E 3</div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Lock className="w-4 h-4 text-sortmy-blue" />
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DashboardPreview;
