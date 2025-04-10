import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button} from '@/components/ui/button';
import { PlusCircle, Briefcase, LayoutGrid, ArrowRight, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="flex h-screen bg-sortmy-dark text-white overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                
                <Button asChild>
                  <Link to="/dashboard/tools/add">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add a Tool
                  </Link>
                </Button>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Welcome back, {user?.username || 'Creator'}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <StatsCard 
                    title="AI Tools" 
                    value="0" 
                    description="Tools tracked"
                    icon={<Briefcase className="w-5 h-5 text-sortmy-blue" />}
                  />
                  <StatsCard 
                    title="Portfolio Items" 
                    value="0" 
                    description="Works published"
                    icon={<LayoutGrid className="w-5 h-5 text-sortmy-blue" />}
                  />
                  {user?.is_premium ? (
                    <Card className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-sortmy-gray/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Crown className="w-5 h-5 text-yellow-400" />
                          SortMyAI+
                        </CardTitle>
                        <CardDescription>Premium Features</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Claude 3.5 Sonnet</span>
                          <Badge variant={user.claude_enabled ? "default" : "outline"} className={user.claude_enabled ? "bg-green-500/20 text-green-400" : ""}>
                            {user.claude_enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Analytics</span>
                          <Badge variant="default" className="bg-sortmy-blue/20 text-sortmy-blue">Active</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-sortmy-gray/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Crown className="w-5 h-5 text-gray-400" />
                          SortMyAI+
                        </CardTitle>
                        <CardDescription>Upgrade your experience</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">Get access to Claude 3.5 Sonnet AI, analytics, and more premium features.</p>
                        <Button size="sm" className="w-full">Upgrade Now</Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-sortmy-gray/10 border-sortmy-gray/30">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Recent Tools</CardTitle>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/dashboard/tools">
                          View All <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="py-8 text-center text-gray-400">
                      <Briefcase className="mx-auto w-12 h-12 mb-3 opacity-30" />
                      <p>You haven't added any tools yet</p>
                      <Button variant="outline" size="sm" className="mt-4" asChild>
                        <Link to="/dashboard/tools/add">
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Add Your First Tool
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-sortmy-gray/10 border-sortmy-gray/30">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Recent Portfolio Items</CardTitle>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/dashboard/portfolio">
                          View All <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="py-8 text-center text-gray-400">
                      <LayoutGrid className="mx-auto w-12 h-12 mb-3 opacity-30" />
                      <p>You haven't added any portfolio items yet</p>
                      <Button variant="outline" size="sm" className="mt-4" asChild>
                        <Link to="/dashboard/portfolio/add">
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Create Your First Portfolio Item
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
        </div>
      </div>
  );
};

const StatsCard = ({ title, value, description, icon }: { 
  title: string; 
  value: string; 
  description: string; 
  icon: React.ReactNode;
}) => {
  return (
    <Card className="bg-sortmy-gray/10 border-sortmy-gray/30">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="bg-sortmy-blue/10 p-2 rounded-full">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
