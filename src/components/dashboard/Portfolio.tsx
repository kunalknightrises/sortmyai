import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PortfolioItem, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import CreatorProfileHeader from '@/components/CreatorProfileHeader';
import { PortfolioFilterTools } from '@/components/portfolio/PortfolioFilterTools';
import PortfolioTabs from '@/components/portfolio/PortfolioTabs';
import { AddProjectCard } from '@/components/portfolio/AddProjectCard';
import { fetchUserProfile, fetchPortfolioItems, migratePortfolioItems } from '@/services/portfolioService';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc, arrayRemove, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import ProfileEditForm from '@/components/profile/ProfileEditForm';

const Portfolio = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [filterTool, setFilterTool] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PortfolioItem | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Function to fetch profile data
  const fetchProfileData = async () => {
    try {
      setLoading(true);

      let userData: User;
      // If username is provided, fetch that user's profile, otherwise use current user
      if (username) {
        userData = await fetchUserProfile(username);
      } else if (currentUser) {
        userData = currentUser;
      } else {
        throw new Error('No user available');
      }

      setUser(userData);

      // Migrate portfolio items to ensure content_type field exists
      await migratePortfolioItems(userData.id);

      // Fetch portfolio items using the user's ID
      const portfolioData = await fetchPortfolioItems(userData.id);
      setPortfolioItems(portfolioData);
    } catch (error: any) {
      console.error('Error fetching profile data:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load profile data on component mount
  useEffect(() => {
    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, currentUser, toast]);

  // Filter items based on selected tool
  const filteredItems = filterTool
    ? portfolioItems.filter(item => item.tools_used.includes(filterTool))
    : portfolioItems;

  // Get unique tools for filter
  const uniqueTools = Array.from(
    new Set(portfolioItems.flatMap(item => item.tools_used))
  );

  const handleTabChange = (value: string) => {
    // Handle tab change without storing the state
    console.log('Tab changed to:', value);
  };

  const handleAddProject = () => {
    navigate('/dashboard/portfolio/add');
  };

  const handleEditProject = (item: PortfolioItem) => {
    navigate(`/dashboard/portfolio/edit/${item.id}`);
  };

  const handleDeleteProject = (item: PortfolioItem) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete || !user) return;

    setActionInProgress(true);
    try {
      // For Google Drive items
      if (itemToDelete.id.startsWith('gdrive-')) {
        // Get the current user document
        const userRef = doc(db, 'users', user.id);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        if (userData?.gdrive_portfolio_items) {
          // Find the item to update
          const items = userData.gdrive_portfolio_items;
          const itemIndex = items.findIndex((item: any) => item.id === itemToDelete.id);

          if (itemIndex !== -1) {
            // Remove the old item
            await updateDoc(userRef, {
              gdrive_portfolio_items: arrayRemove(items[itemIndex])
            });

            // If it's a soft delete, add the updated item back
            if (itemToDelete.status !== 'deleted') {
              const updatedItem = {
                ...items[itemIndex],
                status: 'deleted',
                deleted_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };

              await updateDoc(userRef, {
                gdrive_portfolio_items: arrayUnion(updatedItem)
              });

              // Update local state
              setPortfolioItems(prev =>
                prev.map(item =>
                  item.id === itemToDelete.id
                    ? { ...item, status: 'deleted', deleted_at: new Date().toISOString() }
                    : item
                )
              );

              toast({
                title: "Project Deleted",
                description: "The project has been moved to trash."
              });
            } else {
              // It's a permanent delete, just remove it from state
              setPortfolioItems(prev => prev.filter(item => item.id !== itemToDelete.id));

              toast({
                title: "Project Permanently Deleted",
                description: "The project has been permanently removed."
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete the project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionInProgress(false);
      setShowDeleteDialog(false);
      setItemToDelete(null);
    }
  };

  const handleArchiveProject = async (item: PortfolioItem) => {
    if (!user) return;

    setActionInProgress(true);
    try {
      // For Google Drive items
      if (item.id.startsWith('gdrive-')) {
        // Get the current user document
        const userRef = doc(db, 'users', user.id);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        if (userData?.gdrive_portfolio_items) {
          // Find the item to update
          const items = userData.gdrive_portfolio_items;
          const itemIndex = items.findIndex((i: any) => i.id === item.id);

          if (itemIndex !== -1) {
            // Remove the old item
            await updateDoc(userRef, {
              gdrive_portfolio_items: arrayRemove(items[itemIndex])
            });

            // Add the updated item
            const updatedItem = {
              ...items[itemIndex],
              status: 'archived',
              archived_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            await updateDoc(userRef, {
              gdrive_portfolio_items: arrayUnion(updatedItem)
            });

            // Update local state
            setPortfolioItems(prev =>
              prev.map(i =>
                i.id === item.id
                  ? { ...i, status: 'archived', archived_at: new Date().toISOString() }
                  : i
              )
            );

            toast({
              title: "Project Archived",
              description: "The project has been archived."
            });
          }
        }
      }
    } catch (error) {
      console.error('Error archiving project:', error);
      toast({
        title: "Error",
        description: "Failed to archive the project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const handleRestoreProject = async (item: PortfolioItem) => {
    if (!user) return;

    setActionInProgress(true);
    try {
      // For Google Drive items
      if (item.id.startsWith('gdrive-')) {
        // Get the current user document
        const userRef = doc(db, 'users', user.id);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        if (userData?.gdrive_portfolio_items) {
          // Find the item to update
          const items = userData.gdrive_portfolio_items;
          const itemIndex = items.findIndex((i: any) => i.id === item.id);

          if (itemIndex !== -1) {
            // Remove the old item
            await updateDoc(userRef, {
              gdrive_portfolio_items: arrayRemove(items[itemIndex])
            });

            // Add the updated item
            const updatedItem = {
              ...items[itemIndex],
              status: 'published',
              archived_at: null,
              updated_at: new Date().toISOString()
            };

            await updateDoc(userRef, {
              gdrive_portfolio_items: arrayUnion(updatedItem)
            });

            // Update local state
            setPortfolioItems(prev =>
              prev.map(i =>
                i.id === item.id
                  ? { ...i, status: 'published', archived_at: undefined }
                  : i
              )
            );

            toast({
              title: "Project Restored",
              description: "The project has been restored."
            });
          }
        }
      }
    } catch (error) {
      console.error('Error restoring project:', error);
      toast({
        title: "Error",
        description: "Failed to restore the project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const isCurrentUser = !username || (currentUser && username === currentUser.username) || false;

  return (
    <div className="max-w-screen-lg mx-auto px-4">
      {/* Profile Header */}
      {loading ? (
        <div className="py-8">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <Skeleton className="h-24 w-24 md:h-36 md:w-36 rounded-full" />
            <div className="flex-1 space-y-4 text-center md:text-left">
              <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
              <Skeleton className="h-4 w-full max-w-md" />
              <div className="flex justify-center md:justify-start gap-3 pt-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-8 mt-8">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      ) : (
        <CreatorProfileHeader
          user={user}
          portfolio={portfolioItems}
          isCurrentUser={isCurrentUser}
          onEditClick={() => setIsEditDialogOpen(true)}
        />
      )}

      {/* Tool Filters */}
      {!loading && (
        <PortfolioFilterTools
          uniqueTools={uniqueTools}
          filterTool={filterTool}
          setFilterTool={setFilterTool}
        />
      )}

      {/* Add Project Card - Only show for current user */}
      {isCurrentUser && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <AddProjectCard onClick={handleAddProject} />
        </div>
      )}

      {/* Content Tabs */}
      <PortfolioTabs
        loading={loading}
        filteredItems={filteredItems}
        onTabChange={handleTabChange}
        onEdit={isCurrentUser ? handleEditProject : undefined}
        onDelete={isCurrentUser ? handleDeleteProject : undefined}
        onArchive={isCurrentUser ? handleArchiveProject : undefined}
        onRestore={isCurrentUser ? handleRestoreProject : undefined}
        isOwner={isCurrentUser}
      />

      {/* Profile Edit Dialog */}
      {user && isCurrentUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-sortmy-dark border-sortmy-gray">
            <ProfileEditForm
              user={user}
              onSubmit={async () => {
                setIsEditDialogOpen(false);
                // Refresh user data and refetch portfolio items
                await fetchProfileData();
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {itemToDelete?.status === 'deleted' ? 'Permanently Delete Project?' : 'Delete Project?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete?.status === 'deleted'
                ? 'This action cannot be undone. This will permanently delete your project.'
                : 'This will move the project to trash. You can restore it later if needed.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionInProgress}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={actionInProgress}
              className="bg-red-500 hover:bg-red-600"
            >
              {actionInProgress ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Portfolio;
