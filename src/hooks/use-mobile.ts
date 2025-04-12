import { useState, useEffect } from 'react';
import { isNativePlatform } from '@/lib/capacitor';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    // Consider native platforms as mobile by default
    if (isNativePlatform()) return true;
    // Otherwise use screen width
    return window.innerWidth <= 768;
  });

  useEffect(() => {
    // Only add resize listener if not on a native platform
    if (!isNativePlatform()) {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return isMobile;
}

export function useIsNative() {
  const [isNative, setIsNative] = useState(false);
  
  useEffect(() => {
    const checkNative = async () => {
      setIsNative(isNativePlatform());
    };
    
    checkNative();
  }, []);
  
  return isNative;
}
