
import { useState } from "react";
import { Book, Lock, PlayCircle, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

// Define module interfaces
interface Module {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  isCompleted: boolean;
}

interface Tier {
  id: string;
  name: string;
  isUnlocked: boolean;
  modules: Module[];
}

const Academy = () => {

  // Academy tiers and modules
  const [tiers] = useState<Tier[]>([
    {
      id: "tier1",
      name: "Power of Prompting",
      isUnlocked: true,
      modules: [
        {
          id: "module1",
          title: "Introduction to Prompting",
          description: "Learn the fundamentals of effective prompting in ChatGPT.",
          xpReward: 50,
          isCompleted: false
        },
        {
          id: "module2",
          title: "Clarity and Specificity",
          description: "Master techniques for writing clear and specific prompts.",
          xpReward: 75,
          isCompleted: false
        },
        {
          id: "module3",
          title: "Contextual Prompting",
          description: "Provide better context to get more accurate responses.",
          xpReward: 100,
          isCompleted: false
        },
        {
          id: "module4",
          title: "Iterative Refinement",
          description: "Learn how to refine your prompts through iterative feedback.",
          xpReward: 125,
          isCompleted: false
        },
        {
          id: "module5",
          title: "Role-based Prompting",
          description: "Use role assignments to enhance AI responses.",
          xpReward: 150,
          isCompleted: false
        },
      ]
    },
    {
      id: "tier2",
      name: "Advanced AI Techniques",
      isUnlocked: false,
      modules: [
        {
          id: "module6",
          title: "Chain of Thought Prompting",
          description: "Guide AI through complex reasoning processes.",
          xpReward: 200,
          isCompleted: false
        },
        {
          id: "module7",
          title: "Multi-stage AI Systems",
          description: "Build sophisticated multi-step AI workflows.",
          xpReward: 225,
          isCompleted: false
        },
      ]
    },
    {
      id: "tier3",
      name: "AI Integration Mastery",
      isUnlocked: false,
      modules: [
        {
          id: "module8",
          title: "API Integration",
          description: "Integrate AI capabilities into your applications.",
          xpReward: 300,
          isCompleted: false
        },
      ]
    }
  ]);

  const handleStartModule = (tierId: string, moduleId: string) => {
    console.log(`Starting module ${moduleId} in tier ${tierId}`);
    // In a real implementation, this would navigate to the module content
    // and handle progress tracking
  };

  return (
    <div className="space-y-6 p-1 md:p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Academy</h1>
        <p className="text-gray-400">
          Master AI skills and earn XP through structured learning paths
        </p>
      </div>

      <Separator className="bg-sortmy-gray/30" />

      <div className="space-y-8">
        {tiers.map((tier) => (
          <div key={tier.id} className="space-y-4">
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5 text-sortmy-blue" />
              <h2 className="text-xl font-semibold">{tier.name}</h2>
              {!tier.isUnlocked && (
                <Badge variant="outline" className="ml-2 bg-sortmy-gray/20 text-gray-400">
                  <Lock className="h-3 w-3 mr-1" /> Locked
                </Badge>
              )}
            </div>

            {tier.isUnlocked ? (
              <Accordion type="single" collapsible defaultValue={tier.id} className="w-full">
                <AccordionItem value={tier.id} className="border-sortmy-gray/30">
                  <AccordionTrigger className="text-lg font-medium py-2">
                    Modules
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                      {tier.modules.map((module) => (
                        <motion.div
                          key={module.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex flex-col h-full"
                        >
                          <Card className="border-sortmy-gray/30 bg-sortmy-gray/10 h-full card-glow">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">{module.title}</CardTitle>
                              <CardDescription>{module.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center">
                                <Zap className="h-4 w-4 text-sortmy-blue mr-1" />
                                <span className="text-sm text-sortmy-blue">+{module.xpReward} XP</span>
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Button
                                className="w-full gap-2"
                                onClick={() => handleStartModule(tier.id, module.id)}
                                variant={module.isCompleted ? "secondary" : "default"}
                              >
                                {module.isCompleted ? (
                                  <>Completed</>
                                ) : (
                                  <>
                                    <PlayCircle className="h-4 w-4" />
                                    Start
                                  </>
                                )}
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <div className="p-6 text-center border border-sortmy-gray/30 rounded-lg bg-sortmy-gray/10">
                <Lock className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                <p className="text-gray-400">🔒 Complete previous tiers to unlock this tier.</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Academy;
