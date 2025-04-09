import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

const PricingComparison = () => {
  const features = [
    { name: "Add & manage AI tools", free: true, plus: true },
    { name: "Filter by use case", free: true, plus: true },
    { name: "Smart tool alternatives", free: false, plus: true },
    { name: "Build creator portfolio", free: true, plus: true },
    { name: "Get hired / featured", free: false, plus: true },
    { name: "Early access to new tools", free: true, plus: true },
  ];

  return (
    <section className="py-20 relative bg-gradient-to-b from-sortmy-dark to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">SortMyAI+ Membership</h2>
            <p className="text-xl text-gray-300 mb-6">
              Unlock premium features and get the most out of your AI ecosystem
            </p>
          </div>

          <Card className="bg-gray-800/50 border border-gray-700 shadow-lg overflow-hidden mb-10">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="w-2/5">Feature</TableHead>
                  <TableHead className="w-[30%] text-center">Free</TableHead>
                  <TableHead className="w-[30%] text-center">SortMyAI+</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {features.map((feature, index) => (
                  <TableRow key={index} className="border-gray-700">
                    <TableCell className="font-medium">{feature.name}</TableCell>
                    <TableCell className="text-center">
                      {feature.free ? (
                        <Check className="mx-auto h-5 w-5 text-green-500" />
                      ) : (
                        <X className="mx-auto h-5 w-5 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Check className="mx-auto h-5 w-5 text-sortmy-blue" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="text-center">
            <p className="text-xl mb-6">
              Your AI command center — one login, infinite leverage
            </p>
            <Button size="lg" className="bg-sortmy-blue hover:bg-sortmy-blue/90 text-white group">
              <span className="flex items-center">
                Join SortMyAI+
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingComparison;
