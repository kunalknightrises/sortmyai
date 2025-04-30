import { collection, getDocs, query, where, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Tool } from '@/types';

export const fetchUserTools = async (userId: string): Promise<Tool[]> => {
  const q = query(
    collection(db, 'userTools'), 
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tool));
};

export const fetchAllTools = async (): Promise<Tool[]> => {
  const q = query(collection(db, 'tools'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tool));
};

export const addUserTool = async (userId: string, tool: Tool) => {
  await addDoc(collection(db, 'userTools'), {
    ...tool,
    userId,
    addedAt: new Date().toISOString()
  });
};

export const deleteUserTool = async (toolId: string) => {
  await deleteDoc(doc(db, 'userTools', toolId));
};
