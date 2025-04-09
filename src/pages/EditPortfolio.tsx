import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { PortfolioForm } from '@/components/portfolio/PortfolioForm';
import { useToast } from '@/hooks/use-toast';
import { LoadingState } from '@/components/LoadingState';

export default function EditPortfolio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [portfolioData, setPortfolioData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPortfolioItem = async () => {
      if (!id || !user) return;

      try {
        const docRef = doc(db, 'portfolio', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.user_id !== user.id) {
            navigate('/portfolio');
            return;
          }
          setPortfolioData(data);
        } else {
          navigate('/portfolio');
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch project data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioItem();
  }, [id, user, navigate, toast]);

  const handleSubmit = async (data: any) => {
    if (!user || !id) return;
    
    setIsSubmitting(true);
    try {
      const docRef = doc(db, 'portfolio', id);
      await updateDoc(docRef, {
        ...data,
        updated_at: new Date().toISOString(),
      });

      toast({
        title: 'Success',
        description: 'Your project has been updated.',
      });

      navigate('/portfolio');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-sortmy-dark p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Edit Project</h1>
        <div className="bg-sortmy-darker rounded-lg p-6">
          {portfolioData && (
            <PortfolioForm
              user={user}
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
              initialData={portfolioData}
            />
          )}
        </div>
      </div>
    </div>
  );
}