import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  DocumentData
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';
import { AuthUser } from '@/contexts/AuthContext';
import {
  ViewEvent,
  InteractionEvent,
  AnalyticsSummary,
  PortfolioItemAnalytics,
  ProfileAnalytics,
  UserInteractionSummary
} from '@/types/analytics';
import { format } from 'date-fns';

// Utility to remove undefined fields from an object
export function removeUndefinedFields<T extends Record<string, any>>(obj: T): Record<string, any> {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));
}

// Helper function to get user info
const getUserInfo = async (userId: string): Promise<{
  username?: string;
  avatar_url?: string;
  displayName?: string;
} | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        username: userData.username,
        avatar_url: userData.avatar_url,
        displayName: userData.displayName || userData.username
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
};

// Get browser and device info
const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  const browsers = [
    { name: 'Chrome', pattern: /Chrome\/(\d+)/ },
    { name: 'Firefox', pattern: /Firefox\/(\d+)/ },
    { name: 'Safari', pattern: /Safari\/(\d+)/ },
    { name: 'Edge', pattern: /Edg\/(\d+)/ },
    { name: 'Opera', pattern: /OPR\/(\d+)/ },
    { name: 'IE', pattern: /Trident\/(\d+)/ }
  ];

  const os = [
    { name: 'Windows', pattern: /Windows NT (\d+\.\d+)/ },
    { name: 'Mac', pattern: /Macintosh.*Mac OS X (\d+[._]\d+)/ },
    { name: 'iOS', pattern: /iPhone OS (\d+[._]\d+)/ },
    { name: 'Android', pattern: /Android (\d+\.\d+)/ },
    { name: 'Linux', pattern: /Linux/ }
  ];

  const devices = [
    { name: 'Mobile', pattern: /Mobi|Android|iPhone|iPad|Windows Phone/ },
    { name: 'Tablet', pattern: /Tablet|iPad/ },
    { name: 'Desktop', pattern: /^((?!Mobi|Android|iPhone|iPad|Windows Phone).)*$/ }
  ];

  let browserInfo = 'Unknown';
  for (const browser of browsers) {
    const match = userAgent.match(browser.pattern);
    if (match) {
      browserInfo = `${browser.name} ${match[1]}`;
      break;
    }
  }

  let osInfo = 'Unknown';
  for (const system of os) {
    const match = userAgent.match(system.pattern);
    if (match) {
      osInfo = `${system.name} ${match[1]?.replace('_', '.')}`;
      break;
    }
  }

  let deviceInfo = 'Unknown';
  let isMobile = false;
  for (const device of devices) {
    if (device.pattern.test(userAgent)) {
      deviceInfo = device.name;
      isMobile = device.name === 'Mobile' || device.name === 'Tablet';
      break;
    }
  }

  return {
    browser: browserInfo,
    os: osInfo,
    device: deviceInfo,
    isMobile
  };
};

// Track a view event
export const trackView = async (
  itemId: string,
  itemType: 'portfolio' | 'profile',
  user: User | AuthUser | null
): Promise<string> => {
  try {
    // Check if this user has already viewed this item in the last 24 hours
    // to avoid counting multiple views from the same user in a short period
    if (user) {
      const viewsRef = collection(db, 'analytics_views');
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const recentViewQuery = query(
        viewsRef,
        where('userId', '==', user.uid),
        where('itemId', '==', itemId),
        where('itemType', '==', itemType),
        where('timestamp', '>=', last24Hours)
      );

      const recentViewSnapshot = await getDocs(recentViewQuery);

      if (!recentViewSnapshot.empty) {
        // User has already viewed this item recently, don't count as a new view
        return recentViewSnapshot.docs[0].id;
      }
    }

    // Create a new view event
    const viewEvent: Omit<ViewEvent, 'id'> = {
      userId: user?.uid || null,
      userInfo: user ? {
        username: user.username,
        avatar_url: user.avatar_url,
        displayName: (user as AuthUser).displayName || user.username
      } : undefined,
      itemId,
      itemType,
      timestamp: new Date().toISOString(),
      referrer: document.referrer || undefined,
      deviceInfo: getDeviceInfo()
    };

    // Add to analytics_views collection
    const viewRef = await addDoc(collection(db, 'analytics_views'), removeUndefinedFields(viewEvent));

    // Update the item's view count
    if (itemType === 'portfolio') {
      const portfolioRef = doc(db, 'portfolio', itemId);
      await updateDoc(portfolioRef, {
        views: increment(1)
      });
    } else if (itemType === 'profile') {
      const userRef = doc(db, 'users', itemId);
      await updateDoc(userRef, {
        profile_views: increment(1)
      });
    }

    // Update analytics summary
    await updateAnalyticsSummary(itemId, itemType, 'view', user?.uid || null);

    return viewRef.id;
  } catch (error) {
    console.error('Error tracking view:', error);
    throw error;
  }
};

// Track an interaction event (like, comment, follow)
export const trackInteraction = async (
  itemId: string,
  itemType: 'portfolio' | 'profile',
  interactionType: 'like' | 'comment' | 'follow',
  user: User | AuthUser,
  content?: string
): Promise<string> => {
  try {
    // Create a new interaction event
    const interactionEvent: Omit<InteractionEvent, 'id'> = {
      userId: user.uid,
      userInfo: {
        username: user.username,
        avatar_url: user.avatar_url,
        displayName: (user as AuthUser).displayName || user.username
      },
      itemId,
      itemType,
      interactionType,
      timestamp: new Date().toISOString(),
      content
    };

    // Add to analytics_interactions collection
    const interactionRef = await addDoc(collection(db, 'analytics_interactions'), removeUndefinedFields(interactionEvent));

    // Update analytics summary
    await updateAnalyticsSummary(itemId, itemType, interactionType, user.uid);

    return interactionRef.id;
  } catch (error) {
    console.error(`Error tracking ${interactionType}:`, error);
    throw error;
  }
};

// Update analytics summary
const updateAnalyticsSummary = async (
  itemId: string,
  itemType: 'portfolio' | 'profile',
  eventType: 'view' | 'like' | 'comment' | 'follow',
  userId: string | null
): Promise<void> => {
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const summaryRef = doc(db, `analytics_summary_${itemType}`, itemId);
    const summaryDoc = await getDoc(summaryRef);

    if (!summaryDoc.exists()) {
      // Create a new summary document if it doesn't exist
      await setDoc(summaryRef, removeUndefinedFields({
        totalViews: eventType === 'view' ? 1 : 0,
        uniqueViewers: eventType === 'view' && userId ? 1 : 0,
        totalLikes: eventType === 'like' ? 1 : 0,
        uniqueLikers: eventType === 'like' ? 1 : 0,
        totalComments: eventType === 'comment' ? 1 : 0,
        uniqueCommenters: eventType === 'comment' ? 1 : 0,
        totalFollows: eventType === 'follow' ? 1 : 0,
        uniqueFollowers: eventType === 'follow' ? 1 : 0,
        viewsOverTime: eventType === 'view' ? [{ date: today, count: 1 }] : [],
        likesOverTime: eventType === 'like' ? [{ date: today, count: 1 }] : [],
        commentsOverTime: eventType === 'comment' ? [{ date: today, count: 1 }] : [],
        followsOverTime: eventType === 'follow' ? [{ date: today, count: 1 }] : [],
        viewers: eventType === 'view' && userId ? [userId] : [],
        likers: eventType === 'like' ? [userId] : [],
        commenters: eventType === 'comment' ? [userId] : [],
        followers: eventType === 'follow' ? [userId] : [],
        lastUpdated: new Date().toISOString()
      }));
    } else {
      // Update existing summary
      const summaryData = summaryDoc.data();
      const updateData: any = {
        lastUpdated: new Date().toISOString()
      };

      // Update total counts
      if (eventType === 'view') {
        updateData.totalViews = increment(1);
      } else if (eventType === 'like') {
        updateData.totalLikes = increment(1);
      } else if (eventType === 'comment') {
        updateData.totalComments = increment(1);
      } else if (eventType === 'follow') {
        updateData.totalFollows = increment(1);
      }

      // Update time series data
      const timeSeriesField = `${eventType}sOverTime`;
      const timeSeries = summaryData[timeSeriesField] || [];
      const todayEntry = timeSeries.find((entry: any) => entry.date === today);

      if (todayEntry) {
        // Update today's count
        updateData[timeSeriesField] = timeSeries.map((entry: any) =>
          entry.date === today
            ? { ...entry, count: entry.count + 1 }
            : entry
        );
      } else {
        // Add a new entry for today
        updateData[timeSeriesField] = [...timeSeries, { date: today, count: 1 }];
      }

      // Update unique users if this is a new user
      if (userId) {
        let usersField = `${eventType}ers`;
        if (eventType === 'view') {
          usersField = 'viewers';
        }

        const users = summaryData[usersField] || [];

        if (!users.includes(userId)) {
          updateData[usersField] = [...users, userId];

          const uniqueField = `unique${usersField.charAt(0).toUpperCase() + usersField.slice(1)}`;
          updateData[uniqueField] = increment(1);
        }
      }

      await updateDoc(summaryRef, updateData);
    }
  } catch (error) {
    console.error('Error updating analytics summary:', error);
  }
};

// Get portfolio item analytics
export const getPortfolioItemAnalytics = async (itemId: string): Promise<PortfolioItemAnalytics | null> => {
  try {
    // Get the portfolio item
    const portfolioDoc = await getDoc(doc(db, 'portfolio', itemId));
    if (!portfolioDoc.exists()) {
      return null;
    }

    const portfolioData = portfolioDoc.data();

    // Get analytics summary
    const summaryDoc = await getDoc(doc(db, 'analytics_summary_portfolio', itemId));
    if (!summaryDoc.exists()) {
      // Return basic analytics if no summary exists
      return {
        itemId,
        title: portfolioData.title,
        views: portfolioData.views || 0,
        likes: portfolioData.likes || 0,
        comments: portfolioData.comments || 0,
        viewsOverTime: [],
        recentViewers: [],
        recentLikers: [],
        recentCommenters: []
      };
    }

    const summaryData = summaryDoc.data();

    // Get recent viewers
    const recentViewers = await getRecentInteractors(itemId, 'portfolio', 'view', 5);

    // Get recent likers
    const recentLikers = await getRecentInteractors(itemId, 'portfolio', 'like', 5);

    // Get recent commenters
    const recentCommenters = await getRecentInteractors(itemId, 'portfolio', 'comment', 5);

    return {
      itemId,
      title: portfolioData.title,
      views: portfolioData.views || 0,
      likes: portfolioData.likes || 0,
      comments: portfolioData.comments || 0,
      viewsOverTime: summaryData.viewsOverTime || [],
      recentViewers,
      recentLikers,
      recentCommenters
    };
  } catch (error) {
    console.error('Error getting portfolio item analytics:', error);
    return null;
  }
};

// Get profile analytics
export const getProfileAnalytics = async (userId: string): Promise<ProfileAnalytics | null> => {
  try {
    // Get the user
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();

    // Get analytics summary
    const summaryDoc = await getDoc(doc(db, 'analytics_summary_profile', userId));
    const summaryData = summaryDoc.exists() ? summaryDoc.data() : null;

    // Get portfolio items for this user
    const portfolioQuery = query(
      collection(db, 'portfolio'),
      where('user_id', '==', userId)
    );

    const portfolioSnapshot = await getDocs(portfolioQuery);

    // Calculate total portfolio stats
    let totalPortfolioViews = 0;
    let totalPortfolioLikes = 0;
    let totalPortfolioComments = 0;

    const topPortfolioItems = [];

    for (const docSnapshot of portfolioSnapshot.docs) {
      const itemData = docSnapshot.data();
      totalPortfolioViews += itemData.views || 0;
      totalPortfolioLikes += itemData.likes || 0;
      totalPortfolioComments += itemData.comments || 0;

      topPortfolioItems.push({
        itemId: docSnapshot.id,
        title: itemData.title,
        views: itemData.views || 0,
        likes: itemData.likes || 0,
        comments: itemData.comments || 0
      });
    }

    // Sort top items by views
    topPortfolioItems.sort((a, b) => b.views - a.views);

    // Get recent profile viewers
    const recentViewers = await getRecentInteractors(userId, 'profile', 'view', 10);

    return {
      userId,
      username: userData.username,
      profileViews: userData.profile_views || 0,
      uniqueViewers: summaryData?.uniqueViewers || 0,
      followers: userData.followers_count || 0,
      following: userData.following_count || 0,
      totalPortfolioViews,
      totalPortfolioLikes,
      totalPortfolioComments,
      viewsOverTime: summaryData?.viewsOverTime || [],
      recentViewers,
      topPortfolioItems: topPortfolioItems.slice(0, 5) // Top 5 items
    };
  } catch (error) {
    console.error('Error getting profile analytics:', error);
    return null;
  }
};

// Get recent interactors (viewers, likers, commenters)
export const getRecentInteractors = async (
  itemId: string,
  itemType: 'portfolio' | 'profile',
  interactionType: 'view' | 'like' | 'comment' | 'follow',
  count: number = 10
): Promise<UserInteractionSummary[]> => {
  try {
    const collectionName = interactionType === 'view'
      ? 'analytics_views'
      : 'analytics_interactions';

    const interactionsQuery = query(
      collection(db, collectionName),
      where('itemId', '==', itemId),
      where('itemType', '==', itemType),
      ...(interactionType !== 'view' ? [where('interactionType', '==', interactionType)] : []),
      orderBy('timestamp', 'desc'),
      limit(count)
    );

    const interactionsSnapshot = await getDocs(interactionsQuery);

    const interactors: UserInteractionSummary[] = [];
    const userCounts: Record<string, number> = {};

    for (const docSnapshot of interactionsSnapshot.docs) {
      const data = docSnapshot.data();

      // Skip anonymous views
      if (interactionType === 'view' && !data.userId) continue;

      const userId = data.userId;

      // Count interactions per user
      userCounts[userId] = (userCounts[userId] || 0) + 1;

      // Check if user is already in the list
      const existingUser = interactors.find(user => user.userId === userId);

      if (existingUser) {
        // Update last interaction if this one is more recent
        if (data.timestamp > existingUser.lastInteraction) {
          existingUser.lastInteraction = data.timestamp;
        }
        existingUser.interactionCount = userCounts[userId];
      } else {
        // Add new user to the list
        interactors.push({
          userId,
          username: data.userInfo?.username,
          displayName: data.userInfo?.displayName,
          avatar_url: data.userInfo?.avatar_url,
          interactionCount: userCounts[userId],
          lastInteraction: data.timestamp
        });
      }
    }

    // Sort by interaction count (descending) and then by most recent interaction
    interactors.sort((a, b) => {
      if (b.interactionCount !== a.interactionCount) {
        return b.interactionCount - a.interactionCount;
      }
      return new Date(b.lastInteraction).getTime() - new Date(a.lastInteraction).getTime();
    });

    return interactors.slice(0, count);
  } catch (error) {
    console.error(`Error getting recent ${interactionType}s:`, error);
    return [];
  }
};

// Get analytics summary for a user's portfolio
export const getUserPortfolioAnalytics = async (userId: string): Promise<AnalyticsSummary | null> => {
  try {
    // Get all portfolio items for this user
    const portfolioQuery = query(
      collection(db, 'portfolio'),
      where('user_id', '==', userId)
    );

    const portfolioSnapshot = await getDocs(portfolioQuery);

    if (portfolioSnapshot.empty) {
      return null;
    }

    // Initialize summary
    const summary: AnalyticsSummary = {
      totalViews: 0,
      uniqueViewers: 0,
      totalLikes: 0,
      uniqueLikers: 0,
      totalComments: 0,
      uniqueCommenters: 0,
      viewsOverTime: [],
      likesOverTime: [],
      commentsOverTime: [],
      topViewers: [],
      topLikers: [],
      topCommenters: []
    };

    // Aggregate data from all portfolio items
    const allViewers = new Set<string>();
    const allLikers = new Set<string>();
    const allCommenters = new Set<string>();

    const viewerCounts: Record<string, number> = {};
    const likerCounts: Record<string, number> = {};
    const commenterCounts: Record<string, number> = {};

    const viewsByDate: Record<string, number> = {};
    const likesByDate: Record<string, number> = {};
    const commentsByDate: Record<string, number> = {};

    // Process each portfolio item
    for (const docSnapshot of portfolioSnapshot.docs) {
      const itemId = docSnapshot.id;
      const itemData = docSnapshot.data();

      // Add to total counts
      summary.totalViews += itemData.views || 0;
      summary.totalLikes += itemData.likes || 0;
      summary.totalComments += itemData.comments || 0;

      // Get item analytics summary
      try {
        const summaryRef = doc(db, 'analytics_summary_portfolio', itemId);
        const summaryDoc = await getDoc(summaryRef);

        if (summaryDoc.exists()) {
          // Process viewers
          const summaryData = summaryDoc.data() as DocumentData;

          if (summaryData?.viewers && Array.isArray(summaryData.viewers)) {
            summaryData.viewers.forEach((viewerId: string) => {
              if (viewerId) {
                allViewers.add(viewerId);
                viewerCounts[viewerId] = (viewerCounts[viewerId] || 0) + 1;
              }
            });
          }

          // Process likers
          if (summaryData?.likers && Array.isArray(summaryData.likers)) {
            summaryData.likers.forEach((likerId: string) => {
              if (likerId) {
                allLikers.add(likerId);
                likerCounts[likerId] = (likerCounts[likerId] || 0) + 1;
              }
            });
          }

          // Process commenters
          if (summaryData?.commenters && Array.isArray(summaryData.commenters)) {
            summaryData.commenters.forEach((commenterId: string) => {
              if (commenterId) {
                allCommenters.add(commenterId);
                commenterCounts[commenterId] = (commenterCounts[commenterId] || 0) + 1;
              }
            });
          }

          // Aggregate time series data
          if (summaryData?.viewsOverTime && Array.isArray(summaryData.viewsOverTime)) {
            summaryData.viewsOverTime.forEach((entry: { date: string, count: number }) => {
              viewsByDate[entry.date] = (viewsByDate[entry.date] || 0) + entry.count;
            });
          }

          if (summaryData?.likesOverTime && Array.isArray(summaryData.likesOverTime)) {
            summaryData.likesOverTime.forEach((entry: { date: string, count: number }) => {
              likesByDate[entry.date] = (likesByDate[entry.date] || 0) + entry.count;
            });
          }

          if (summaryData?.commentsOverTime && Array.isArray(summaryData.commentsOverTime)) {
            summaryData.commentsOverTime.forEach((entry: { date: string, count: number }) => {
              commentsByDate[entry.date] = (commentsByDate[entry.date] || 0) + entry.count;
            });
          }
        }
      } catch (error) {
        console.error('Error getting analytics summary:', error);
      }
    }

    // Set unique counts
    summary.uniqueViewers = allViewers.size;
    summary.uniqueLikers = allLikers.size;
    summary.uniqueCommenters = allCommenters.size;

    // Convert time series data
    summary.viewsOverTime = Object.entries(viewsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    summary.likesOverTime = Object.entries(likesByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    summary.commentsOverTime = Object.entries(commentsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get top interactors
    summary.topViewers = await getTopInteractors(Array.from(allViewers), viewerCounts, 10);
    summary.topLikers = await getTopInteractors(Array.from(allLikers), likerCounts, 10);
    summary.topCommenters = await getTopInteractors(Array.from(allCommenters), commenterCounts, 10);

    return summary;
  } catch (error) {
    console.error('Error getting user portfolio analytics:', error);
    return null;
  }
};

// Helper to get top interactors with user info
const getTopInteractors = async (
  userIds: string[],
  countMap: Record<string, number>,
  limit: number
): Promise<UserInteractionSummary[]> => {
  try {
    // Sort users by interaction count
    const sortedUserIds = userIds.sort((a, b) => (countMap[b] || 0) - (countMap[a] || 0));

    // Get user info for top users
    const topUsers: UserInteractionSummary[] = [];

    for (const userId of sortedUserIds.slice(0, limit)) {
      const userInfo = await getUserInfo(userId);

      if (userInfo) {
        topUsers.push({
          userId,
          username: userInfo.username,
          displayName: userInfo.displayName,
          avatar_url: userInfo.avatar_url,
          interactionCount: countMap[userId] || 0,
          lastInteraction: new Date().toISOString() // We don't have this info here
        });
      }
    }

    return topUsers;
  } catch (error) {
    console.error('Error getting top interactors:', error);
    return [];
  }
};

// Get analytics for a specific date range
export const getAnalyticsForDateRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  views: number;
  likes: number;
  comments: number;
  viewsOverTime: { date: string, count: number }[];
  likesOverTime: { date: string, count: number }[];
  commentsOverTime: { date: string, count: number }[];
}> => {
  try {
    // Format dates
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');

    // Get all portfolio items for this user
    const portfolioQuery = query(
      collection(db, 'portfolio'),
      where('user_id', '==', userId)
    );

    const portfolioSnapshot = await getDocs(portfolioQuery);

    // Initialize result
    const result = {
      views: 0,
      likes: 0,
      comments: 0,
      viewsOverTime: [] as { date: string, count: number }[],
      likesOverTime: [] as { date: string, count: number }[],
      commentsOverTime: [] as { date: string, count: number }[]
    };

    // Aggregate data from all portfolio items
    const viewsByDate: Record<string, number> = {};
    const likesByDate: Record<string, number> = {};
    const commentsByDate: Record<string, number> = {};

    // Process each portfolio item
    for (const docSnapshot of portfolioSnapshot.docs) {
      const itemId = docSnapshot.id;

      // Get item analytics summary
      try {
        const summaryRef = doc(db, 'analytics_summary_portfolio', itemId);
        const summaryDoc = await getDoc(summaryRef);

        if (summaryDoc.exists()) {
          // Process views over time
          const summaryData = summaryDoc.data() as DocumentData;

          if (summaryData?.viewsOverTime && Array.isArray(summaryData.viewsOverTime)) {
            summaryData.viewsOverTime.forEach((entry: { date: string, count: number }) => {
              if (entry.date >= startDateStr && entry.date <= endDateStr) {
                viewsByDate[entry.date] = (viewsByDate[entry.date] || 0) + entry.count;
                result.views += entry.count;
              }
            });
          }

          // Process likes over time
          if (summaryData?.likesOverTime && Array.isArray(summaryData.likesOverTime)) {
            summaryData.likesOverTime.forEach((entry: { date: string, count: number }) => {
              if (entry.date >= startDateStr && entry.date <= endDateStr) {
                likesByDate[entry.date] = (likesByDate[entry.date] || 0) + entry.count;
                result.likes += entry.count;
              }
            });
          }

          // Process comments over time
          if (summaryData?.commentsOverTime && Array.isArray(summaryData.commentsOverTime)) {
            summaryData.commentsOverTime.forEach((entry: { date: string, count: number }) => {
              if (entry.date >= startDateStr && entry.date <= endDateStr) {
                commentsByDate[entry.date] = (commentsByDate[entry.date] || 0) + entry.count;
                result.comments += entry.count;
              }
            });
          }
        }
      } catch (error) {
        console.error('Error getting analytics summary for date range:', error);
      }
    }

    // Convert time series data
    result.viewsOverTime = Object.entries(viewsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    result.likesOverTime = Object.entries(likesByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    result.commentsOverTime = Object.entries(commentsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return result;
  } catch (error) {
    console.error('Error getting analytics for date range:', error);
    return {
      views: 0,
      likes: 0,
      comments: 0,
      viewsOverTime: [],
      likesOverTime: [],
      commentsOverTime: []
    };
  }
};
