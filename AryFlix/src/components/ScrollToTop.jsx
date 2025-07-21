
/*
=== SCROLL TO TOP COMPONENT ===

This component remembers scroll positions when users navigate between pages.
- Saves scroll position when leaving a page
- Restores scroll position when returning to a page
- Scrolls to top for new pages

Used in App.jsx to improve user experience during navigation.
*/

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPathnameRef = useRef(pathname);
  const scrollPositionsRef = useRef({});

  useEffect(() => {
    // Save current scroll position before navigation
    if (prevPathnameRef.current && prevPathnameRef.current !== pathname) {
      scrollPositionsRef.current[prevPathnameRef.current] = window.scrollY;
    }

    // Handle navigation
    if (prevPathnameRef.current !== pathname) {
      // Check if we have a saved position for this page
      const savedPosition = scrollPositionsRef.current[pathname];
      
      if (savedPosition !== undefined) {
        // Restore saved position
        window.scrollTo(0, savedPosition);
      } else {
        // New page, scroll to top
        window.scrollTo(0, 0);
      }
      
      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  return null;
}

export default ScrollToTop;
