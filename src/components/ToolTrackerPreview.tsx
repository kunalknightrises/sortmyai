import { Button } from "@/components/ui/button";
import { Lock, ArrowRight, Brain } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ToolTrackerPreview = () => {
  const tools = [
    { name: "Pika", category: "AI Video", alternative: "Runway" },
    { name: "ElevenLabs", category: "Voice Generation", alternative: "Play.ht" },
    { name: "Midjourney", category: "Image Generation", alternative: "DALL-E 3" },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto relative">
          {/* Brain background with moderate opacity */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 z-0 pointer-events-none">
            <Brain className="w-64 h-64 text-sortmy-blue" />
          </div>

          <div className="text-center mb-12 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Create your own personal library of AI tools</h2>
            <p className="text-xl text-gray-300 mb-8">
              Keep track of all your AI tools in one place, organize them by use case, and never forget that perfect tool again.
            </p>
          </div>

          {/* Tool Tracker Table Preview */}
          <div className="bg-sortmy-darker/40 border border-sortmy-blue/20 shadow-[0_0_20px_rgba(0,102,255,0.15)] backdrop-blur-sm rounded-xl overflow-hidden mb-8 relative z-10">
            <div className="px-4 py-3 bg-sortmy-darker/30 border-b border-sortmy-blue/20 flex justify-between items-center">
              <h3 className="font-semibold">Your AI Tool Collection</h3>
              <Button variant="ghost" size="sm" className="text-blue-400">View All</Button>
            </div>
            <div className="overflow-x-auto">
              <Table className="bg-transparent">
                <TableHeader>
                  <TableRow className="border-sortmy-blue/10">
                    <TableHead>Tool</TableHead>
                    <TableHead>Use Case</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Lock size={14} className="text-sortmy-blue" />
                        Better Alternative
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tools.map((tool, index) => (
                    <TableRow key={index} className="border-sortmy-blue/10">
                      <TableCell className="font-medium bg-transparent">{tool.name}</TableCell>
                      <TableCell className="bg-transparent">{tool.category}</TableCell>
                      <TableCell className="bg-transparent">
                        <div className="flex items-center gap-2">
                          <span className="filter blur-sm">{tool.alternative}</span>
                          <Lock size={14} className="text-sortmy-blue" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="text-center relative z-10">
            <p className="text-xl text-sortmy-blue mb-6">
              Unlock SortMyAI+ to get smarter tool suggestions, updates, and replacements.
            </p>
            <Button className="bg-sortmy-blue hover:bg-sortmy-blue/90 text-white group relative overflow-hidden">
              <span className="relative z-10 flex items-center">
                Get SortMyAI+
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ToolTrackerPreview;