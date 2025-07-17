/**
 * usePageTitle - Custom React Hook for Dynamic Browser Tab Titles
 * 
 * This hook automatically updates the browser tab title to show the current page.
 * It follows the format: "Page Name - AryFlix" for consistency across the app.
 * 
 * Usage Examples:
 * - usePageTitle("Home")           → Tab shows: "Home - AryFlix"
 * - usePageTitle("Avengers")       → Tab shows: "Avengers - AryFlix"  
 * - usePageTitle("Watchlist")      → Tab shows: "Watchlist - AryFlix"
 * - usePageTitle()                 → Tab shows: "AryFlix - Discover Movies & TV Shows" (default)
 * 
 * Benefits:
 * - Automatic title updates when page content changes
 * - Consistent branding across all pages
 * - Professional UX (like Netflix, YouTube, etc.)
 * - Clean code - just one line per component
 */

import { useEffect } from 'react';

// Custom hook to manage dynamic page titles
const usePageTitle = (title) => {
  useEffect(() => {
    // Update the title with AryFlix branding
    if (title) {
      document.title = `${title} - AryFlix`;
    } else {
      document.title = 'AryFlix - Discover Movies & TV Shows';
    }
  }, [title]);
};

export default usePageTitle;
