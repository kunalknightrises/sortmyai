import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the types of backgrounds available
export type BackgroundType = 'aurora' | 'simple';
export type BackgroundIntensity = 'low' | 'medium' | 'high';

interface BackgroundContextType {
  backgroundType: BackgroundType;
  backgroundIntensity: BackgroundIntensity;
  setBackgroundType: (type: BackgroundType) => void;
  setBackgroundIntensity: (intensity: BackgroundIntensity) => void;
  cycleBackgroundType: () => void;
}

const BackgroundContext = createContext<BackgroundContextType>({
  backgroundType: 'simple',
  backgroundIntensity: 'medium',
  setBackgroundType: () => {},
  setBackgroundIntensity: () => {},
  cycleBackgroundType: () => {}
});

export const useBackground = () => useContext(BackgroundContext);

export const BackgroundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or default to 'simple'
  const [backgroundType, setBackgroundTypeState] = useState<BackgroundType>(() => {
    const saved = localStorage.getItem('backgroundType');
    // Convert 'synthwave' to 'simple' if it was previously saved
    if (saved === 'synthwave') return 'simple';
    return (saved as BackgroundType) || 'simple';
  });

  const [backgroundIntensity, setBackgroundIntensityState] = useState<BackgroundIntensity>(() => {
    const saved = localStorage.getItem('backgroundIntensity');
    return (saved as BackgroundIntensity) || 'medium';
  });

  // Save to localStorage whenever the background type changes
  useEffect(() => {
    localStorage.setItem('backgroundType', backgroundType);
  }, [backgroundType]);

  // Save to localStorage whenever the background intensity changes
  useEffect(() => {
    localStorage.setItem('backgroundIntensity', backgroundIntensity);
  }, [backgroundIntensity]);

  // Function to set background type and save to localStorage
  const setBackgroundType = (type: BackgroundType) => {
    setBackgroundTypeState(type);
  };

  // Function to set background intensity and save to localStorage
  const setBackgroundIntensity = (intensity: BackgroundIntensity) => {
    setBackgroundIntensityState(intensity);
  };

  // Function to cycle through background types
  const cycleBackgroundType = () => {
    setBackgroundTypeState(prev => {
      if (prev === 'simple') return 'aurora';
      return 'simple';
    });
  };

  return (
    <BackgroundContext.Provider
      value={{
        backgroundType,
        backgroundIntensity,
        setBackgroundType,
        setBackgroundIntensity,
        cycleBackgroundType
      }}
    >
      {children}
    </BackgroundContext.Provider>
  );
};

export default BackgroundProvider;
