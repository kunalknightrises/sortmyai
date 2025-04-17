import {
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
  increment,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Like, Comment, LikeWithUser, CommentWithUser, InteractionStats } from '@/types/interactions';
import { User } from '@/types';
import { trackInteraction } from '@/services/analyticsService';

// ===== LIKES =====

// Add a like to a post
export const likePost = async (userId: string, postId: string): Promise<string> => {
  try {
    // Check if user already liked the post
    const existingLike = await checkUserLiked(userId, postId);
    if (existingLike) {
      throw new Error('You have already liked this post');
    }

    // Add like to likes collection
    const likeRef = await addDoc(collection(db, 'likes'), {
      userId,
      postId,
      createdAt: new Date().toISOString()
    });

    // Increment likes count on the post
    const postRef = doc(db, 'portfolio', postId);
    await updateDoc(postRef, {
      likes: increment(1)
    });

    // Track like for analytics
    try {
      // Get user data for tracking
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        await trackInteraction(postId, 'portfolio', 'like', {
          ...userData,
          uid: userId
        });
      }
    } catch (trackError) {
      console.error('Error tracking like:', trackError);
      // Continue anyway, this is just analytics
    }

    return likeRef.id;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

// Remove a like from a post
export const unlikePost = async (userId: string, postId: string): Promise<void> => {
  try {
    // Find the like document
    const likesRef = collection(db, 'likes');
    const q = query(
      likesRef,
      where('userId', '==', userId),
      where('postId', '==', postId),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('Like not found');
    }

    // Delete the like document
    await deleteDoc(doc(db, 'likes', querySnapshot.docs[0].id));

    // Decrement likes count on the post
    const postRef = doc(db, 'portfolio', postId);
    await updateDoc(postRef, {
      likes: increment(-1)
    });
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
};

// Check if a user has liked a post
export const checkUserLiked = async (userId: string, postId: string): Promise<boolean> => {
  try {
    const likesRef = collection(db, 'likes');
    const q = query(
      likesRef,
      where('userId', '==', userId),
      where('postId', '==', postId),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking if user liked post:', error);
    return false;
  }
};

// Get all likes for a post
export const getPostLikes = async (postId: string): Promise<Like[]> => {
  try {
    const likesRef = collection(db, 'likes');
    const q = query(
      likesRef,
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

    const likes: Like[] = [];
    querySnapshot.forEach((doc) => {
      likes.push({
        id: doc.id,
        ...doc.data()
      } as Like);
    });

    return likes;
  } catch (error) {
    console.error('Error getting post likes:', error);
    throw error;
  }
};

// Get likes with user details
export const getPostLikesWithUsers = async (postId: string): Promise<LikeWithUser[]> => {
  try {
    const likes = await getPostLikes(postId);

    const likesWithUsers = await Promise.all(
      likes.map(async (like) => {
        const userDoc = await getDoc(doc(db, 'users', like.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          return {
            ...like,
            username: userData.username,
            userAvatar: userData.avatar_url,
            user: {
              ...userData,
              uid: like.userId
            }
          } as LikeWithUser;
        }
        return {
          ...like,
          user: { uid: like.userId, email: 'Unknown User' } as User
        } as LikeWithUser;
      })
    );

    return likesWithUsers;
  } catch (error) {
    console.error('Error getting post likes with users:', error);
    throw error;
  }
};

// Get all posts liked by a user
export const getUserLikedPosts = async (userId: string): Promise<string[]> => {
  try {
    const likesRef = collection(db, 'likes');
    const q = query(
      likesRef,
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);

    const postIds: string[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      postIds.push(data.postId);
    });

    return postIds;
  } catch (error) {
    console.error('Error getting user liked posts:', error);
    throw error;
  }
};

// ===== COMMENTS =====

// Add a comment to a post
export const addComment = async (
  userId: string,
  postId: string,
  content: string,
  parentId?: string
): Promise<string> => {
  try {
    // Get user data for the comment
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.exists() ? userDoc.data() as User : null;

    // Add comment to comments collection
    const commentRef = await addDoc(collection(db, 'comments'), {
      userId,
      postId,
      content,
      createdAt: new Date().toISOString(),
      username: userData?.username || 'Unknown User',
      userAvatar: userData?.avatar_url || '',
      likes: 0,
      ...(parentId && { parentId })
    });

    // Try to increment comments count on the post
    try {
      const postRef = doc(db, 'portfolio', postId);
      await updateDoc(postRef, {
        comments: increment(1)
      });
    } catch (updateError) {
      console.warn('Could not update comment count on post, but comment was added:', updateError);
      // Continue anyway since the comment was added successfully
      // Try to find the post in user's gdrive_portfolio_items and update it there
      try {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);

        for (const userDoc of usersSnapshot.docs) {
          const userData = userDoc.data();

          // Check if user has gdrive_portfolio_items
          if (userData.gdrive_portfolio_items && Array.isArray(userData.gdrive_portfolio_items)) {
            const itemIndex = userData.gdrive_portfolio_items.findIndex((item: any) => item.id === postId);

            if (itemIndex !== -1) {
              // Update the item's comment count
              const updatedItems = [...userData.gdrive_portfolio_items];
              const currentItem = updatedItems[itemIndex];
              updatedItems[itemIndex] = {
                ...currentItem,
                comments: (currentItem.comments || 0) + 1
              };

              // Update the user document
              const userRef = doc(db, 'users', userDoc.id);
              await updateDoc(userRef, {
                gdrive_portfolio_items: updatedItems
              });

              break; // Exit the loop once we've found and updated the item
            }
          }
        }
      } catch (secondaryError) {
        console.warn('Could not update comment count in user document:', secondaryError);
        // Continue anyway since the comment was added successfully
      }
    }

    // Track comment for analytics
    try {
      if (userData) {
        await trackInteraction(postId, 'portfolio', 'comment', {
          ...userData,
          uid: userId
        }, content);
      }
    } catch (trackError) {
      console.error('Error tracking comment:', trackError);
      // Continue anyway, this is just analytics
    }

    return commentRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Update a comment
export const updateComment = async (
  commentId: string,
  userId: string,
  content: string
): Promise<void> => {
  try {
    // Get the comment to verify ownership
    const commentDoc = await getDoc(doc(db, 'comments', commentId));

    if (!commentDoc.exists()) {
      throw new Error('Comment not found');
    }

    const commentData = commentDoc.data();

    if (commentData.userId !== userId) {
      throw new Error('You can only edit your own comments');
    }

    // Update the comment
    await updateDoc(doc(db, 'comments', commentId), {
      content,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (commentId: string, userId: string): Promise<void> => {
  try {
    // Get the comment to verify ownership and get postId
    const commentDoc = await getDoc(doc(db, 'comments', commentId));

    if (!commentDoc.exists()) {
      throw new Error('Comment not found');
    }

    const commentData = commentDoc.data();

    if (commentData.userId !== userId) {
      throw new Error('You can only delete your own comments');
    }

    // Delete the comment
    await deleteDoc(doc(db, 'comments', commentId));

    // Decrement comments count on the post
    const postRef = doc(db, 'portfolio', commentData.postId);
    await updateDoc(postRef, {
      comments: increment(-1)
    });

    // If this is a parent comment, also delete all replies
    if (!commentData.parentId) {
      // Find all replies to this comment
      const repliesQuery = query(
        collection(db, 'comments'),
        where('parentId', '==', commentId)
      );

      const repliesSnapshot = await getDocs(repliesQuery);

      // Delete each reply
      const deletePromises = repliesSnapshot.docs.map(async (replyDoc) => {
        await deleteDoc(replyDoc.ref);

        // Decrement comments count for each reply
        await updateDoc(postRef, {
          comments: increment(-1)
        });
      });

      await Promise.all(deletePromises);
    }
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// Get all comments for a post
export const getPostComments = async (postId: string): Promise<Comment[]> => {
  try {
    // Get top-level comments (no parentId)
    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef,
      where('postId', '==', postId),
      where('parentId', '==', null),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

    const comments: Comment[] = [];
    querySnapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data()
      } as Comment);
    });

    return comments;
  } catch (error) {
    console.error('Error getting post comments:', error);
    throw error;
  }
};

// Get all comments and replies for a post
export const getPostCommentsWithReplies = async (postId: string): Promise<CommentWithUser[]> => {
  try {
    // Get all comments for the post
    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef,
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

    const allComments: Comment[] = [];
    querySnapshot.forEach((doc) => {
      allComments.push({
        id: doc.id,
        ...doc.data()
      } as Comment);
    });

    // Separate top-level comments and replies
    const topLevelComments = allComments.filter(comment => !comment.parentId);
    const replies = allComments.filter(comment => comment.parentId);

    // Get user data for all comments
    const commentsWithUsers = await Promise.all(
      topLevelComments.map(async (comment) => {
        // Get user data
        const userDoc = await getDoc(doc(db, 'users', comment.userId));
        const userData = userDoc.exists() ? userDoc.data() as User : { uid: comment.userId, email: 'Unknown User' };

        // Get replies for this comment
        const commentReplies = replies
          .filter(reply => reply.parentId === comment.id)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        // Get user data for replies
        const repliesWithUsers = await Promise.all(
          commentReplies.map(async (reply) => {
            const replyUserDoc = await getDoc(doc(db, 'users', reply.userId));
            const replyUserData = replyUserDoc.exists()
              ? replyUserDoc.data() as User
              : { uid: reply.userId, email: 'Unknown User' };

            return {
              ...reply,
              user: {
                ...replyUserData,
                uid: reply.userId
              }
            } as CommentWithUser;
          })
        );

        return {
          ...comment,
          user: {
            ...userData,
            uid: comment.userId
          },
          replies: repliesWithUsers
        } as CommentWithUser;
      })
    );

    return commentsWithUsers;
  } catch (error) {
    console.error('Error getting post comments with replies:', error);
    throw error;
  }
};

// Get all comments by a user
export const getUserComments = async (userId: string): Promise<Comment[]> => {
  try {
    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);

    const comments: Comment[] = [];
    querySnapshot.forEach((doc) => {
      comments.push({
        id: doc.id,
        ...doc.data()
      } as Comment);
    });

    return comments;
  } catch (error) {
    console.error('Error getting user comments:', error);
    throw error;
  }
};

// ===== INTERACTION STATS =====

// Get interaction stats for a post
export const getPostInteractionStats = async (postId: string, userId?: string): Promise<InteractionStats> => {
  try {
    // Get post document to get likes and comments count
    const postDoc = await getDoc(doc(db, 'portfolio', postId));

    if (!postDoc.exists()) {
      // Try to find the post in user's gdrive_portfolio_items
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();

        // Check if user has gdrive_portfolio_items
        if (userData.gdrive_portfolio_items && Array.isArray(userData.gdrive_portfolio_items)) {
          const item = userData.gdrive_portfolio_items.find((item: any) => item.id === postId);

          if (item) {
            // Check if user has liked the post
            let userHasLiked = false;
            if (userId) {
              userHasLiked = await checkUserLiked(userId, postId);
            }

            return {
              likes: item.likes || 0,
              comments: item.comments || 0,
              userHasLiked
            };
          }
        }
      }

      // If we get here, the post was not found anywhere
      // Return default values instead of throwing an error
      return {
        likes: 0,
        comments: 0,
        userHasLiked: false
      };
    }

    const postData = postDoc.data();

    // Check if user has liked the post
    let userHasLiked = false;
    if (userId) {
      userHasLiked = await checkUserLiked(userId, postId);
    }

    return {
      likes: postData.likes || 0,
      comments: postData.comments || 0,
      userHasLiked
    };
  } catch (error) {
    console.error('Error getting post interaction stats:', error);
    // Return default values instead of throwing an error
    return {
      likes: 0,
      comments: 0,
      userHasLiked: false
    };
  }
};
