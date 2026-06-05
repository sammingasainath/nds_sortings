import React, { useEffect, useState } from 'react';
import { Monitor, AlertTriangle } from 'lucide-react';

export const MobileWarning: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      
      // Prevent scrolling on mobile
      if (isMobileView) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
    };

    // Check on mount
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20">
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
          <h2 className="text-lg font-semibold">Desktop View Required</h2>
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            <p>Please use a larger screen</p>
          </div>
          <p className="text-sm text-muted-foreground">
            This application is optimized for desktop viewing. Please access it from a device with a larger screen for the best experience.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Minimum screen width required: 768px
          </p>
        </div>
      </div>
    </div>
  );
}; 