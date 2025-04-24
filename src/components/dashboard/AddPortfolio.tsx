import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { PortfolioForm } from '@/components/portfolio/PortfolioForm';
import PostTypeSelector from '@/components/portfolio/PostTypeSelector';
import { useToast } from '@/hooks/use-toast';

export default function AddPortfolio() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postType, setPostType] = useState<'image' | 'video' | 'link' | null>(null);

  const handleSubmit = async (data: any) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Add to the portfolio collection
      await addDoc(collection(db, 'portfolio'), {
        ...data,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Also add to the user's gdrive_portfolio_items array for consistency
      if (data.id && data.media_url && data.media_url.includes('drive.google.com')) {
        const userRef = doc(db, 'users', user.id);
        const portfolioItem = {
          id: data.id,
          userId: user.id,
          title: data.title,
          description: data.description,
          media_url: data.media_url,
          media_urls: data.media_urls || [data.media_url],
          media_type: data.media_type || 'image',
          content_type: data.content_type || 'post',
          tools_used: data.tools_used || [],
          categories: [],
          likes: 0,
          views: 0,
          project_url: data.project_url || '',
          is_public: data.is_public,
          status: data.status || 'published',
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
          deleted_at: data.status === 'deleted' ? new Date().toISOString() : null,
          archived_at: data.status === 'archived' ? new Date().toISOString() : null
        };

        await updateDoc(userRef, {
          gdrive_portfolio_items: arrayUnion(portfolioItem)
        });
      }

      toast({
        title: 'Success',
        description: 'Your project has been added to your portfolio.',
      });

      navigate('/dashboard/portfolio');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  const handlePostTypeSelect = (type: 'image' | 'video' | 'link') => {
    setPostType(type);
  };

  return (
    <div className="min-h-screen bg-sortmy-dark p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Add New Project</h1>
        <div className="bg-sortmy-darker rounded-lg p-6">
          {!postType ? (
            <PostTypeSelector onSelect={handlePostTypeSelect} />
          ) : (
            <PortfolioForm
              user={user}
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
              skipFirebaseUpdate={true} // Skip the direct Firebase update in the form
              initialData={{
                content_type: postType === 'video' ? 'reel' : 'post',
                project_url: postType === 'link' ? '' : undefined,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}