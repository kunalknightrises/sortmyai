import {
  doc,
  getDoc,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';

// Follow a creator
export const followCreator = async (userId: string, creatorId: string): Promise<void> => {
  try {
    // Don't allow following yourself
    if (userId === creatorId) {
      throw new Error('You cannot follow yourself');
    }

    // Check if creator exists
    const creatorRef = doc(db, 'users', creatorId);
    const creatorDoc = await getDoc(creatorRef);

    if (!creatorDoc.exists()) {
      throw new Error('Creator not found');
    }

    // Check if user already follows this creator
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userFollowing = userDoc.data().following || [];
    const isAlreadyFollowing = userFollowing.includes(creatorId);

    if (isAlreadyFollowing) {
      throw new Error('You are already following this creator');
    }

    // Update user's following list
    await updateDoc(userRef, {
      following: arrayUnion(creatorId),
      following_count: increment(1)
    });

    // Update creator's followers count
    await updateDoc(creatorRef, {
      followers_count: increment(1)
    });
  } catch (error) {
    console.error('Error following creator:', error);
    throw error;
  }
};

// Unfollow a creator
export const unfollowCreator = async (userId: string, creatorId: string): Promise<void> => {
  try {
    // Check if user follows this creator
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userFollowing = userDoc.data().following || [];
    const isFollowing = userFollowing.includes(creatorId);

    if (!isFollowing) {
      throw new Error('You are not following this creator');
    }

    // Update user's following list
    await updateDoc(userRef, {
      following: arrayRemove(creatorId),
      following_count: increment(-1)
    });

    // Update creator's followers count
    const creatorRef = doc(db, 'users', creatorId);
    await updateDoc(creatorRef, {
      followers_count: increment(-1)
    });
  } catch (error) {
    console.error('Error unfollowing creator:', error);
    throw error;
  }
};

// Check if a user follows a creator
export const checkIfFollowing = async (userId: string, creatorId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return false;
    }

    const userFollowing = userDoc.data().following || [];
    return userFollowing.includes(creatorId);
  } catch (error) {
    console.error('Error checking if following:', error);
    return false;
  }
};

// Get followers of a creator
export const getFollowers = async (creatorId: string): Promise<string[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('following', 'array-contains', creatorId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error('Error getting followers:', error);
    throw error;
  }
};

// Get followers with user details
export const getFollowersWithDetails = async (creatorId: string): Promise<User[]> => {
  try {
    const followerIds = await getFollowers(creatorId);
    const followers = await Promise.all(
      followerIds.map(async (id) => {
        const userDoc = await getDoc(doc(db, 'users', id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          return { id, uid: id, ...userData } as User;
        }
        return null;
      })
    );

    return followers.filter(Boolean) as User[];
  } catch (error) {
    console.error('Error getting followers with details:', error);
    throw error;
  }
};

// Get users that a user is following
export const getFollowing = async (userId: string): Promise<string[]> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return [];
    }

    return userDoc.data().following || [];
  } catch (error) {
    console.error('Error getting following:', error);
    throw error;
  }
};

// Get following with user details
export const getFollowingWithDetails = async (userId: string): Promise<User[]> => {
  try {
    const followingIds = await getFollowing(userId);
    const following = await Promise.all(
      followingIds.map(async (id) => {
        const userDoc = await getDoc(doc(db, 'users', id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          return { id, uid: id, ...userData } as User;
        }
        return null;
      })
    );

    return following.filter(Boolean) as User[];
  } catch (error) {
    console.error('Error getting following with details:', error);
    throw error;
  }
};
