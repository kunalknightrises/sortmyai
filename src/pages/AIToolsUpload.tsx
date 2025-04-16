import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AITool } from '@/types';
import { bulkAddAITools } from '@/services/aiToolsService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Check, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AIToolsUpload: React.FC = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [jsonInput, setJsonInput] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedCount, setUploadedCount] = useState<number>(0);
  const [singleTool, setSingleTool] = useState<Omit<AITool, 'id'>>({
    name: '',
    useCase: '',
    description: '',
    tags: [],
    pricing: '',
    excelsAt: '',
    website: '',
    logoUrl: ''
  });

  // Handle JSON input change
  const handleJsonInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
  };

  // Handle single tool form input change
  const handleSingleToolChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSingleTool(prev => ({
      ...prev,
      [name]: name === 'tags' ? value.split(',').map(tag => tag.trim()) : value
    }));
  };

  // Handle bulk upload from JSON
  const handleBulkUpload = async () => {
    if (!isAdmin) {
      toast({
        title: 'Permission Denied',
        description: 'You need admin privileges to upload AI tools.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsUploading(true);

      // Parse JSON input
      let tools: Omit<AITool, 'id'>[] = [];
      try {
        const parsed = JSON.parse(jsonInput);

        // Handle both array and object formats
        if (Array.isArray(parsed)) {
          tools = parsed.map(tool => ({
            name: tool.Name || tool.name,
            useCase: tool["Use Case"] || tool.useCase,
            description: tool.Description || tool.description,
            tags: typeof (tool.Tags || tool.tags) === 'string'
              ? (tool.Tags || tool.tags).split(',').map((tag: string) => tag.trim())
              : (tool.Tags || tool.tags || []),
            pricing: tool.Pricing || tool.pricing,
            excelsAt: tool["Excels At"] || tool.excelsAt,
            website: tool["Website Link"] || tool.websiteLink || tool.website,
            logoUrl: tool["Logo Link"] || tool.logoLink || tool.logoUrl
          }));
        } else if (typeof parsed === 'object') {
          // Single object
          tools = [{
            name: parsed.Name || parsed.name,
            useCase: parsed["Use Case"] || parsed.useCase,
            description: parsed.Description || parsed.description,
            tags: typeof (parsed.Tags || parsed.tags) === 'string'
              ? (parsed.Tags || parsed.tags).split(',').map((tag: string) => tag.trim())
              : (parsed.Tags || parsed.tags || []),
            pricing: parsed.Pricing || parsed.pricing,
            excelsAt: parsed["Excels At"] || parsed.excelsAt,
            website: parsed["Website Link"] || parsed.websiteLink || parsed.website,
            logoUrl: parsed["Logo Link"] || parsed.logoLink || parsed.logoUrl
          }];
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
        toast({
          title: 'Invalid JSON',
          description: 'Please check your JSON format and try again.',
          variant: 'destructive'
        });
        setIsUploading(false);
        return;
      }

      if (tools.length === 0) {
        toast({
          title: 'No Tools Found',
          description: 'No valid AI tools were found in the provided JSON.',
          variant: 'destructive'
        });
        setIsUploading(false);
        return;
      }

      // Upload tools to Firebase
      const ids = await bulkAddAITools(tools);
      setUploadedCount(ids.length);

      toast({
        title: 'Upload Successful',
        description: `Successfully uploaded ${ids.length} AI tools to the database.`,
        variant: 'default'
      });

      // Clear the input
      setJsonInput('');
    } catch (error) {
      console.error('Error uploading AI tools:', error);
      toast({
        title: 'Upload Failed',
        description: 'An error occurred while uploading the AI tools. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle single tool upload
  const handleSingleToolUpload = async () => {
    if (!isAdmin) {
      toast({
        title: 'Permission Denied',
        description: 'You need admin privileges to upload AI tools.',
        variant: 'destructive'
      });
      return;
    }

    // Validate required fields
    if (!singleTool.name || !singleTool.description) {
      toast({
        title: 'Missing Information',
        description: 'Name and description are required fields.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsUploading(true);

      // Upload single tool to Firebase
      await bulkAddAITools([singleTool]);
      setUploadedCount(prev => prev + 1);

      toast({
        title: 'Upload Successful',
        description: `Successfully added "${singleTool.name}" to the database.`,
        variant: 'default'
      });

      // Clear the form
      setSingleTool({
        name: '',
        useCase: '',
        description: '',
        tags: [],
        pricing: '',
        excelsAt: '',
        website: '',
        logoUrl: ''
      });
    } catch (error) {
      console.error('Error uploading AI tool:', error);
      toast({
        title: 'Upload Failed',
        description: 'An error occurred while uploading the AI tool. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Sample JSON for reference
  const sampleJson = JSON.stringify([
    {
      "Name": "Lindy",
      "Use Case": "AI Workflow Automation",
      "Description": "Build AI agents to automate workflows, integrating with various apps to save time and enhance productivity.",
      "Tags": "AI, Automation, Productivity",
      "Pricing": "Freemium",
      "Excels At": "Workflow Automation, App Integration",
      "Website Link": "lindy.ai",
      "Logo Link": "https://example.com/logo.png"
    }
  ], null, 2);

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card className="bg-sortmy-darker border-sortmy-gray">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You need administrator privileges to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="bg-sortmy-darker border-sortmy-gray">
        <CardHeader>
          <CardTitle className="text-2xl">AI Tools Upload</CardTitle>
          <CardDescription>
            Upload AI tools to the database. You can upload in bulk using JSON or add tools individually.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="bulk" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="bulk">Bulk Upload (JSON)</TabsTrigger>
              <TabsTrigger value="single">Single Tool Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="bulk" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jsonInput">JSON Input</Label>
                <Textarea
                  id="jsonInput"
                  placeholder="Paste your JSON data here..."
                  className="min-h-[300px] font-mono text-sm bg-sortmy-darker border-sortmy-gray"
                  value={jsonInput}
                  onChange={handleJsonInputChange}
                />
                <p className="text-xs text-gray-400">
                  Paste JSON data containing AI tools. Each tool should have the properties shown in the example below.
                </p>
              </div>

              <div className="bg-gray-800/30 p-4 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-medium">Sample JSON Format</h3>
                </div>
                <pre className="text-xs overflow-auto p-2 bg-black/20 rounded">
                  {sampleJson}
                </pre>
              </div>

              <Button
                onClick={handleBulkUpload}
                disabled={isUploading || !jsonInput.trim()}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload AI Tools
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="single" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Tool Name"
                    className="bg-sortmy-darker border-sortmy-gray"
                    value={singleTool.name}
                    onChange={handleSingleToolChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="useCase">Use Case</Label>
                  <Input
                    id="useCase"
                    name="useCase"
                    placeholder="Primary Use Case"
                    className="bg-sortmy-darker border-sortmy-gray"
                    value={singleTool.useCase}
                    onChange={handleSingleToolChange}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Tool Description"
                    className="bg-sortmy-darker border-sortmy-gray"
                    value={singleTool.description}
                    onChange={handleSingleToolChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    name="tags"
                    placeholder="AI, Productivity, etc."
                    className="bg-sortmy-darker border-sortmy-gray"
                    value={Array.isArray(singleTool.tags) ? singleTool.tags.join(', ') : ''}
                    onChange={handleSingleToolChange}
                  />
                  <p className="text-xs text-gray-400">Separate tags with commas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricing">Pricing</Label>
                  <Input
                    id="pricing"
                    name="pricing"
                    placeholder="Free, Freemium, Paid, etc."
                    className="bg-sortmy-darker border-sortmy-gray"
                    value={singleTool.pricing}
                    onChange={handleSingleToolChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excelsAt">Excels At</Label>
                  <Input
                    id="excelsAt"
                    name="excelsAt"
                    placeholder="What the tool is best at"
                    className="bg-sortmy-darker border-sortmy-gray"
                    value={singleTool.excelsAt}
                    onChange={handleSingleToolChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteLink">Website Link</Label>
                  <Input
                    id="website"
                    name="website"
                    placeholder="example.com"
                    className="bg-sortmy-darker border-sortmy-gray"
                    value={singleTool.website}
                    onChange={handleSingleToolChange}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="logoLink">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    name="logoUrl"
                    placeholder="https://example.com/logo.png"
                    className="bg-sortmy-darker border-sortmy-gray"
                    value={singleTool.logoUrl}
                    onChange={handleSingleToolChange}
                  />
                </div>
              </div>

              <Button
                onClick={handleSingleToolUpload}
                disabled={isUploading || !singleTool.name || !singleTool.description}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Add AI Tool
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-sortmy-gray pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-green-500" />
            <span>Total tools uploaded: <strong>{uploadedCount}</strong></span>
          </div>
          <div className="text-xs text-gray-400">
            Tools will be stored in the 'aiTools' collection
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AIToolsUpload;
