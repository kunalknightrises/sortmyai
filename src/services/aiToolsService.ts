import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AITool } from '@/types';

const COLLECTION_NAME = 'aiTools';

// Add a single AI tool
export const addAITool = async (tool: AITool): Promise<string> => {
  try {
    const toolWithTimestamp = {
      ...tool,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), toolWithTimestamp);
    return docRef.id;
  } catch (error) {
    console.error('Error adding AI tool:', error);
    throw error;
  }
};

// Bulk add AI tools
export const bulkAddAITools = async (tools: AITool[]): Promise<string[]> => {
  try {
    const ids: string[] = [];

    // Use a batch or transaction for better performance with large datasets
    for (const tool of tools) {
      const toolWithTimestamp = {
        ...tool,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), toolWithTimestamp);
      ids.push(docRef.id);
    }

    return ids;
  } catch (error) {
    console.error('Error bulk adding AI tools:', error);
    throw error;
  }
};

// Get all AI tools
export const getAllAITools = async (): Promise<AITool[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AITool));
  } catch (error) {
    console.error('Error getting AI tools:', error);
    throw error;
  }
};

// Get AI tools by tag
export const getAIToolsByTag = async (tag: string): Promise<AITool[]> => {
  try {
    // Note: This is a simple implementation that checks if the tag string contains the search tag
    // For more complex filtering, you might want to use an array of tags and array-contains query
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));

    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AITool))
      .filter(tool => tool.tags.toLowerCase().includes(tag.toLowerCase()));
  } catch (error) {
    console.error('Error getting AI tools by tag:', error);
    throw error;
  }
};

// Update an AI tool
export const updateAITool = async (id: string, tool: Partial<AITool>): Promise<void> => {
  try {
    const toolRef = doc(db, COLLECTION_NAME, id);

    await updateDoc(toolRef, {
      ...tool,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating AI tool:', error);
    throw error;
  }
};

// Delete an AI tool
export const deleteAITool = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting AI tool:', error);
    throw error;
  }
};
