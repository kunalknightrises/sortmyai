import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PortfolioItem, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
// import { Skeleton } from '@/components/ui/skeleton';
import CreatorProfileHeader from '@/components/CreatorProfileHeader';
import { PortfolioFilterTools } from '@/components/portfolio/PortfolioFilterTools';
import PortfolioTabs from '@/components/portfolio/PortfolioTabs';
import { TrashItems } from '@/components/dashboard/TrashItems';
import { fetchUserProfile, fetchPortfolioItems, migratePortfolioItems, removeDeletedGDriveItems, resetGDriveItems } from '@/services/portfolioService';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
// import GlassCard from '@/components/ui/GlassCard';
import NeonButton from '@/components/ui/NeonButton';
import ClickEffect from '@/components/ui/ClickEffect';
import NeonSkeleton from '@/components/ui/NeonSkeleton';
import PortfolioOnboarding from '@/components/portfolio/PortfolioOnboarding';


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
  const [showClearTrashDialog, setShowClearTrashDialog] = useState(false);
  const [showRecoverAllDialog, setShowRecoverAllDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

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
        // Check if user needs onboarding
        if (!userData.onboarded) {
          setShowOnboarding(true);
          setLoading(false);
          return;
        }
      } else {
        throw new Error('No user available');
      }

      setUser(userData);

      // Migrate portfolio items to ensure content_type field exists
      await migratePortfolioItems(userData.id);

      // Fetch portfolio items using the user's ID, including deleted items
      const portfolioData = await fetchPortfolioItems(userData.id, true);
      console.log('Fetched portfolio data with deleted items:', portfolioData);
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

  // Filter items based on selected tool and exclude deleted items for display
  const filteredItems = portfolioItems
    .filter(item => item.status !== 'deleted') // Exclude deleted items
    .filter(item => !filterTool || item.tools_used.includes(filterTool)); // Apply tool filter if selected

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
      console.log('Deleting item:', itemToDelete);

      // For Google Drive items
      if (itemToDelete.id.startsWith('gdrive-')) {
        // Get the current user document
        const userRef = doc(db, 'users', user.id);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        if (userData?.gdrive_portfolio_items) {
          // Find the item to update
          const items = userData.gdrive_portfolio_items;
          // Find the item by ID, but also check for items with the same media_url as a fallback
          let itemIndex = items.findIndex((item: any) => item.id === itemToDelete.id);

          // If item not found by ID, try to find by media_url (for items with changing IDs)
          if (itemIndex === -1 && itemToDelete.media_url) {
            itemIndex = items.findIndex((item: any) => item.media_url === itemToDelete.media_url);
          }

          if (itemIndex !== -1) {
            // If it's not already deleted, mark it as deleted
            if (itemToDelete.status !== 'deleted') {
              // Create a new array with the updated item
              const updatedItems = [...items];
              updatedItems[itemIndex] = {
                ...items[itemIndex],
                status: 'deleted',
                deleted_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };

              // Update the entire array at once
              await updateDoc(userRef, {
                gdrive_portfolio_items: updatedItems
              });

              // Force refresh portfolio data from the server
              await fetchProfileData();

              toast({
                title: "Project Deleted",
                description: "The project has been moved to trash."
              });
            } else {
              // It's a permanent delete, remove it completely
              // Remove the item from the array
              const updatedItems = items.filter((item: any) => item.id !== itemToDelete.id);

              // Update the entire array at once
              await updateDoc(userRef, {
                gdrive_portfolio_items: updatedItems
              });

              // Force refresh portfolio data from the server
              await fetchProfileData();

              toast({
                title: "Project Permanently Deleted",
                description: "The project has been permanently removed."
              });
            }
          }
        }
      } else {
        // Handle non-Google Drive items (regular portfolio items)
        // For now, just update the local state to mark it as deleted
        // This is a temporary solution until we implement proper deletion for all item types
        if (itemToDelete.status !== 'deleted') {
          // Soft delete - mark as deleted
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
          // Hard delete - remove from state
          setPortfolioItems(prev => prev.filter(item => item.id !== itemToDelete.id));

          // Force refresh portfolio data from the server
          await fetchProfileData();

          toast({
            title: "Project Permanently Deleted",
            description: "The project has been permanently removed."
          });
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
          // Find the item by ID, but also check for items with the same media_url as a fallback
          let itemIndex = items.findIndex((i: any) => i.id === item.id);

          // If item not found by ID, try to find by media_url (for items with changing IDs)
          if (itemIndex === -1 && item.media_url) {
            itemIndex = items.findIndex((i: any) => i.media_url === item.media_url);
          }

          if (itemIndex !== -1) {
            // Create a new array with the updated item
            const updatedItems = [...items];
            updatedItems[itemIndex] = {
              ...items[itemIndex],
              status: 'archived',
              archived_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            // Update the entire array at once
            await updateDoc(userRef, {
              gdrive_portfolio_items: updatedItems
            });

            // Force refresh portfolio data from the server
            await fetchProfileData();

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

  // Handle recovering a single item from trash
  const handleRecoverItem = async (item: PortfolioItem) => {
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
          // Find the item by ID, but also check for items with the same media_url as a fallback
          let itemIndex = items.findIndex((i: any) => i.id === item.id);

          // If item not found by ID, try to find by media_url (for items with changing IDs)
          if (itemIndex === -1 && item.media_url) {
            itemIndex = items.findIndex((i: any) => i.media_url === item.media_url);
          }

          if (itemIndex !== -1) {
            // Create a new array with the updated item
            const updatedItems = [...items];
            updatedItems[itemIndex] = {
              ...items[itemIndex],
              status: 'published',
              deleted_at: null,
              updated_at: new Date().toISOString()
            };

            // Update the entire array at once
            await updateDoc(userRef, {
              gdrive_portfolio_items: updatedItems
            });

            // Force refresh portfolio data from the server
            await fetchProfileData();

            toast({
              title: "Item Recovered",
              description: "The item has been restored from trash."
            });
          }
        }
      } else {
        // Handle non-Google Drive items
        setPortfolioItems(prev =>
          prev.map(i =>
            i.id === item.id
              ? { ...i, status: 'published', deleted_at: undefined }
              : i
          )
        );

        toast({
          title: "Item Recovered",
          description: "The item has been restored from trash."
        });
      }
    } catch (error) {
      console.error('Error recovering item:', error);
      toast({
        title: "Error",
        description: "Failed to recover the item. Please try again.",
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
          // Find the item by ID, but also check for items with the same media_url as a fallback
          let itemIndex = items.findIndex((i: any) => i.id === item.id);

          // If item not found by ID, try to find by media_url (for items with changing IDs)
          if (itemIndex === -1 && item.media_url) {
            itemIndex = items.findIndex((i: any) => i.media_url === item.media_url);
          }

          if (itemIndex !== -1) {
            // Create a new array with the updated item
            const updatedItems = [...items];
            updatedItems[itemIndex] = {
              ...items[itemIndex],
              status: 'published',
              archived_at: null,
              updated_at: new Date().toISOString()
            };

            // Update the entire array at once
            await updateDoc(userRef, {
              gdrive_portfolio_items: updatedItems
            });

            // Force refresh portfolio data from the server
            await fetchProfileData();

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

  // Get all items in trash
  const trashItems = portfolioItems.filter(item => item.status === 'deleted');
  console.log('Trash items:', trashItems);

  // Handle clearing all trash items
  const handleClearTrash = () => {
    setShowClearTrashDialog(true);
  };

  const confirmClearTrash = async () => {
    if (!user) return;

    setActionInProgress(true);
    try {
      // First try to use the removeDeletedGDriveItems function
      console.log('Attempting to remove deleted items...');
      await removeDeletedGDriveItems(user.id);

      // As a fallback, also try the reset function which is more aggressive
      console.log('Also performing a reset as a fallback...');
      await resetGDriveItems(user.id);

      // Force refresh portfolio data from the server
      console.log('Refreshing portfolio data...');
      await fetchProfileData();

      // Check if there are still deleted items
      const remainingTrash = portfolioItems.filter(item => item.status === 'deleted');
      if (remainingTrash.length > 0) {
        console.error('ERROR: Still found deleted items after clearing trash:', remainingTrash);
        toast({
          title: "Warning",
          description: `${remainingTrash.length} items could not be removed. Please try again.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Trash Cleared",
          description: "All items have been permanently removed from trash."
        });
      }
    } catch (error) {
      console.error('Error clearing trash:', error);
      toast({
        title: "Error",
        description: "Failed to clear trash. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionInProgress(false);
      setShowClearTrashDialog(false);
    }
  };

  // Handle recovering all trash items
  const handleRecoverAll = () => {
    setShowRecoverAllDialog(true);
  };

  const confirmRecoverAll = async () => {
    if (!user) return;

    setActionInProgress(true);
    try {
      // Get the current user document
      const userRef = doc(db, 'users', user.id);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      if (userData?.gdrive_portfolio_items) {
        // Find all deleted items
        const items = userData.gdrive_portfolio_items;
        // Find all deleted items and log them for debugging
        const deletedItems = items.filter((item: any) => item.status === 'deleted');
        console.log('Deleted items to recover:', deletedItems);

        // Create a new array with all items recovered
        const updatedItems = items.map((item: any) => {
          if (item.status === 'deleted') {
            return {
              ...item,
              status: 'published',
              deleted_at: null,
              updated_at: new Date().toISOString()
            };
          }
          return item;
        });

        // Update the entire array at once
        await updateDoc(userRef, {
          gdrive_portfolio_items: updatedItems
        });

        // Force refresh portfolio data from the server
        await fetchProfileData();

        toast({
          title: "All Items Recovered",
          description: `${deletedItems.length} items have been restored from trash.`
        });
      }
    } catch (error) {
      console.error('Error recovering items:', error);
      toast({
        title: "Error",
        description: "Failed to recover items. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionInProgress(false);
      setShowRecoverAllDialog(false);
    }
  };

  if (showOnboarding) {
    return (
      <PortfolioOnboarding 
        onComplete={() => {
          setShowOnboarding(false);
          fetchProfileData();
        }} 
      />
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto px-4">

      {/* Profile Header */}
      {loading ? (
        <div className="py-8">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <NeonSkeleton height="144px" width="144px" className="rounded-full" />
            <div className="flex-1 space-y-4 text-center md:text-left">
              <NeonSkeleton height="32px" width="192px" className="mx-auto md:mx-0" />
              <NeonSkeleton height="16px" className="w-full max-w-md" />
              <div className="flex justify-center md:justify-start gap-3 pt-2">
                <NeonSkeleton height="40px" width="96px" />
                <NeonSkeleton height="40px" width="96px" />
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-8 mt-8">
            <NeonSkeleton height="24px" width="64px" />
            <NeonSkeleton height="24px" width="64px" />
            <NeonSkeleton height="24px" width="64px" />
          </div>
        </div>
      ) : (
        <CreatorProfileHeader
          user={user}
          portfolio={portfolioItems}
          isCurrentUser={isCurrentUser}
          onEditClick={() => setIsEditDialogOpen(true)}
          onAddProject={handleAddProject}
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

      {/* Trash Management - Only show for current user */}
      {isCurrentUser && (
        <>

          {/* Trash Management */}
          {trashItems.length > 0 && (
            <div className="mb-6 p-4 bg-sortmy-gray/10 border border-sortmy-blue/20 rounded-lg">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Trash</h3>
                  <p className="text-sm text-gray-400">{trashItems.length} item{trashItems.length !== 1 ? 's' : ''} in trash</p>
                </div>
                <div className="flex gap-3">
                  <ClickEffect effect="ripple" color="blue">
                    <NeonButton variant="cyan" onClick={handleRecoverAll}>
                      Recover All
                    </NeonButton>
                  </ClickEffect>
                  <ClickEffect effect="ripple" color="blue">
                    <NeonButton variant="magenta" className="bg-red-500/30 hover:bg-red-500/50" onClick={handleClearTrash}>
                      Clear Trash
                    </NeonButton>
                  </ClickEffect>
                  <ClickEffect effect="ripple" color="blue">
                    <NeonButton variant="magenta" className="bg-red-700/30 hover:bg-red-700/50" onClick={() => setShowResetDialog(true)}>
                      Reset Portfolio
                    </NeonButton>
                  </ClickEffect>
                </div>
              </div>

              {/* Display trash items with individual recovery options */}
              <TrashItems
                items={trashItems}
                onRecover={handleRecoverItem}
                onDelete={handleDeleteProject}
              />
            </div>
          )}
        </>
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
          <DialogContent className="sm:max-w-[600px] bg-sortmy-dark border-sortmy-blue/20 backdrop-blur-md">
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
        <AlertDialogContent className="bg-sortmy-dark border-sortmy-blue/20 backdrop-blur-md">
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
            <ClickEffect effect="ripple" color="blue">
              <NeonButton variant="cyan" disabled={actionInProgress} onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </NeonButton>
            </ClickEffect>
            <ClickEffect effect="ripple" color="blue">
              <NeonButton
                variant="magenta"
                onClick={confirmDelete}
                disabled={actionInProgress}
                className="bg-red-500 hover:bg-red-600 border-red-500/50"
              >
                {actionInProgress ? 'Deleting...' : 'Delete'}
              </NeonButton>
            </ClickEffect>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Trash Confirmation Dialog */}
      <AlertDialog open={showClearTrashDialog} onOpenChange={setShowClearTrashDialog}>
        <AlertDialogContent className="bg-sortmy-dark border-sortmy-blue/20 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Trash?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {trashItems.length} item{trashItems.length !== 1 ? 's' : ''} in your trash. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <ClickEffect effect="ripple" color="blue">
              <NeonButton variant="cyan" disabled={actionInProgress} onClick={() => setShowClearTrashDialog(false)}>
                Cancel
              </NeonButton>
            </ClickEffect>
            <ClickEffect effect="ripple" color="blue">
              <NeonButton
                variant="magenta"
                onClick={confirmClearTrash}
                disabled={actionInProgress}
                className="bg-red-500 hover:bg-red-600 border-red-500/50"
              >
                {actionInProgress ? 'Clearing...' : 'Clear All'}
              </NeonButton>
            </ClickEffect>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Recover All Confirmation Dialog */}
      <AlertDialog open={showRecoverAllDialog} onOpenChange={setShowRecoverAllDialog}>
        <AlertDialogContent className="bg-sortmy-dark border-sortmy-blue/20 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Recover All Items?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore all {trashItems.length} item{trashItems.length !== 1 ? 's' : ''} from your trash.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <ClickEffect effect="ripple" color="blue">
              <NeonButton variant="cyan" disabled={actionInProgress} onClick={() => setShowRecoverAllDialog(false)}>
                Cancel
              </NeonButton>
            </ClickEffect>
            <ClickEffect effect="ripple" color="blue">
              <NeonButton
                variant="gradient"
                onClick={confirmRecoverAll}
                disabled={actionInProgress}
              >
                {actionInProgress ? 'Recovering...' : 'Recover All'}
              </NeonButton>
            </ClickEffect>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Portfolio Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="bg-sortmy-dark border-sortmy-blue/20 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Portfolio?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset your portfolio to only include published items. All deleted, archived, and draft items will be permanently removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <ClickEffect effect="ripple" color="blue">
              <NeonButton variant="cyan" disabled={actionInProgress} onClick={() => setShowResetDialog(false)}>
                Cancel
              </NeonButton>
            </ClickEffect>
            <ClickEffect effect="ripple" color="blue">
              <NeonButton
                variant="magenta"
                onClick={async () => {
                  if (!user) return;
                  setActionInProgress(true);
                  try {
                    await resetGDriveItems(user.id);
                    await fetchProfileData();
                    toast({
                      title: "Portfolio Reset",
                      description: "Your portfolio has been reset to only include published items."
                    });
                  } catch (error) {
                    console.error('Error resetting portfolio:', error);
                    toast({
                      title: "Error",
                      description: "Failed to reset portfolio. Please try again.",
                      variant: "destructive"
                    });
                  } finally {
                    setActionInProgress(false);
                    setShowResetDialog(false);
                  }
                }}
                disabled={actionInProgress}
                className="bg-red-700 hover:bg-red-800 border-red-700/50"
              >
                {actionInProgress ? 'Resetting...' : 'Reset Portfolio'}
              </NeonButton>
            </ClickEffect>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Portfolio;