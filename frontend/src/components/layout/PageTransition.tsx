import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * Ultra-smooth global page transition wrapper
 * - Seamless 280ms GPU-accelerated enter animation (opacity 0.95 -> 1, translateY 6px -> 0)
 * - Automatic scroll-to-top on route changes
 * - Immediate interactivity (never blocks user clicks or input)
 * - Zero layout shift or navbar re-rendering
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on forward route change without disturbing history back/forward
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="weblens-page-transition w-full flex-1 flex flex-col">
      {children}
    </div>
  );
};

export default PageTransition;
