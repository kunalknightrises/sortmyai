import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { X, Plus, ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: "Tool name must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  website_url: z.string().url({ message: "Please enter a valid URL" }),
  logo_url: z.string().url({ message: "Please enter a valid logo URL" }).optional(),
  tags: z.array(z.string()).min(1, { message: "Add at least one tag" }),
});

const AddTool = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      website_url: "",
      logo_url: "",
      tags: [],
    },
  });

  const addTag = () => {
    if (newTag.trim() && !form.getValues().tags.includes(newTag.trim())) {
      form.setValue('tags', [...form.getValues().tags, newTag.trim()]);
      setNewTag('');
      form.clearErrors('tags');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = form.getValues().tags.filter(tag => tag !== tagToRemove);
    form.setValue('tags', updatedTags);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;

    try {
      setIsSubmitting(true);

      // Add tool record to Firestore
      const toolsRef = collection(db, 'tools');
      await addDoc(toolsRef, {
        name: values.name,
        description: values.description,
        website_url: values.website_url,
        website: values.website_url, // Add website field for compatibility
        logo_url: values.logo_url || '',
        tags: values.tags,
        user_id: user.uid,
        created_at: new Date().toISOString(),
        is_favorite: false,
        rating: 0,
        price_tier: 'freemium',
        notes: ''
      });

      toast({
        title: "Tool added",
        description: "Your tool has been added successfully.",
      });

      navigate('/dashboard/tools');
    } catch (error: any) {
      console.error('Error adding tool:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add tool. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Button variant="ghost" className="mb-4" onClick={() => navigate('/dashboard/tools')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Tools
      </Button>

      <Card className="bg-sortmy-gray/10 border-sortmy-gray/30">
        <CardHeader>
          <CardTitle>Add a New Tool</CardTitle>
          <CardDescription>
            Add details about an AI tool you use in your workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tool Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Midjourney" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="logo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/logo.png" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter the URL of the tool's logo image
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={() => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {form.getValues().tags.map((tag, i) => (
                              <div
                                key={i}
                                className="bg-sortmy-gray/20 text-white px-3 py-1 rounded-full flex items-center gap-1"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="w-4 h-4 rounded-full bg-sortmy-gray/50 flex items-center justify-center hover:bg-sortmy-gray/80"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2">
                            <Input
                              placeholder="Add a tag..."
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addTag();
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addTag}
                            >
                              <Plus className="w-4 h-4 mr-1" /> Add
                            </Button>
                          </div>
                        </div>
                        <FormDescription>
                          Add tags like "image generator", "code assistant", etc.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what this tool does and how you use it..."
                            className="min-h-32 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto"
                >
                  {isSubmitting ? 'Saving...' : 'Add Tool'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddTool;
