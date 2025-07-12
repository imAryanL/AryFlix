import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Step 1: Create the "shared data container" - like creating an empty box
const WatchlistContext = createContext();

// Step 2: Create a custom hook to easily access the shared data
// This is like creating a "key" to open the shared box
export const useWatchlist = () => {
  // Try to get data from the context box
  const context = useContext(WatchlistContext);
  
  // If no data found, it means we forgot to wrap our app with the Provider
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  
  // Return the shared data so components can use it
  return context;
};

// Step 3: Create the Provider component - this actually puts data IN the box
export const WatchlistProvider = ({ children }) => {
  // State to store all the data we want to share
  const [watchlistItems, setWatchlistItems] = useState([]); // User's saved movies/shows
  const [user, setUser] = useState(null);                   // Current logged-in user
  const [loading, setLoading] = useState(true);             // Loading state

  // When the component first loads, get the current user
  useEffect(() => {
    const getCurrentUser = async () => {
      // Ask Supabase: "Who is currently logged in?"
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);           // Save the user info
      setLoading(false);       // We're done loading
    };
    getCurrentUser();
  }, []); // Empty array = only run once when component loads

  // When the user changes (login/logout), update the watchlist
  useEffect(() => {
    if (user) {
      // If someone is logged in, get their watchlist
      fetchWatchlist();
    } else {
      // If no one is logged in, clear the watchlist
      setWatchlistItems([]);
    }
  }, [user]); // Run this whenever 'user' changes

  // Function to get user's watchlist from the database
  const fetchWatchlist = async () => {
    if (!user) return; // Don't run if no user is logged in
    
    try {
      // Ask Supabase: "Get all watchlist items for this user"
      const { data, error } = await supabase
        .from('watchlist')                    // From the watchlist table
        .select('*')                          // Get all columns
        .eq('user_id', user.id)              // Where user_id matches current user
        .order('created_at', { ascending: true }); // Oldest items first
        
      if (error) throw error;
      
      // Save the watchlist items to our state
      setWatchlistItems(data || []);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
  };

  // Function to add a movie/show to the watchlist
  const addToWatchlist = async (mediaId, mediaType = 'movie') => {
    if (!user) return false; // Can't add if not logged in
    
    try {
      // Tell Supabase: "Add this item to the user's watchlist"
      const { error } = await supabase
        .from('watchlist')
        .insert([{
          user_id: user.id,                   // Who owns this item
          media_id: mediaId.toString(),       // What movie/show (convert to string)
          media_type: mediaType               // Is it a movie or TV show?
        }]);
        
      if (error) throw error;
      
      // Refresh the watchlist to show the new item
      await fetchWatchlist();
      return true; // Success!
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return false; // Failed
    }
  };

  // Function to remove a movie/show from the watchlist
  const removeFromWatchlist = async (mediaId) => {
    if (!user) return false; // Can't remove if not logged in
    
    try {
      // Tell Supabase: "Delete this item from the user's watchlist"
      const { error } = await supabase
        .from('watchlist')
        .delete()                             // Delete operation
        .eq('user_id', user.id)              // Where user_id matches current user
        .eq('media_id', mediaId.toString()); // And media_id matches the item
        
      if (error) throw error;
      
      // Refresh the watchlist to remove the item from our state
      await fetchWatchlist();
      return true; // Success!
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return false; // Failed
    }
  };

  // Function to check if a movie/show is already in the watchlist
  const isInWatchlist = (mediaId) => {
    // Look through all watchlist items and see if any match this mediaId
    return watchlistItems.some(item => item.media_id === mediaId.toString());
  };

  // Step 4: Package all the data and functions we want to share
  const value = {
    watchlistItems,      // The list of saved items
    user,               // Current user info
    loading,            // Loading state
    addToWatchlist,     // Function to add items
    removeFromWatchlist, // Function to remove items
    isInWatchlist,      // Function to check if item is saved
    fetchWatchlist      // Function to refresh the list
  };

  // Step 5: Put all the data in the "shared box" and make it available to child components
  return (
    <WatchlistContext.Provider value={value}>
      {children} {/* All child components can now access the shared data */}
    </WatchlistContext.Provider>
  );
};
