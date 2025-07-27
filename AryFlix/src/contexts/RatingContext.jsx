import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { API_URL } from '../api';

// Create the rating context
const RatingContext = createContext();

// Custom hook to use rating context
export const useRating = () => {
  const context = useContext(RatingContext);
  if (!context) {
    throw new Error('useRating must be used within a RatingProvider');
  }
  return context;
};

// Rating Provider component
export const RatingProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getCurrentUser();
  }, []);

  // Get user's rating for a specific movie/TV show
  const getUserRating = async (mediaId) => {
    if (!user) return null;
    
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        console.error('No access token found');
        return null;
      }

      const response = await fetch(`${API_URL}/api/ratings/${mediaId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      console.log('Get rating response:', data);
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error getting user rating:', error);
      return null;
    }
  };

  // Submit or update a rating
  const submitRating = async (mediaId, mediaType, rating) => {
    console.log('🎯 Starting submitRating:', { mediaId, mediaType, rating, user: user?.id });
    
    if (!user) {
      console.error('No user found');
      return false;
    }
    
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        console.error('No access token found');
        return false;
      }

      console.log('🔑 Token found, making API call...');
      
      const response = await fetch(`${API_URL}/api/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          media_id: mediaId,
          media_type: mediaType,
          rating: rating
        })
      });
      
      console.log('📡 API Response status:', response.status);
      
      const data = await response.json();
      console.log('📡 API Response data:', data);
      
      if (!response.ok) {
        console.error('API Error:', data);
        return false;
      }
      
      return data.success;
    } catch (error) {
      console.error('Error submitting rating:', error);
      return false;
    }
  };

  // Get average rating for a movie/TV show
  const getAverageRating = async (mediaId) => {
    try {
      const response = await fetch(`${API_URL}/api/ratings/${mediaId}/average`);
      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error getting average rating:', error);
      return null;
    }
  };

  // Get all ratings by the current user - NEW FUNCTION
  const getAllUserRatings = async () => {
    // If no user is logged in, return empty array
    if (!user) return [];
    
    try {
      // Get user's session token for authentication
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        console.error('No access token found');
        return [];
      }

      // Call our new backend endpoint
      const response = await fetch(`${API_URL}/api/ratings/user/all`, {
        headers: {
          'Authorization': `Bearer ${token}`  // Send token for authentication
        }
      });
      
      const data = await response.json();
      console.log('Get all ratings response:', data);
      
      // Return the ratings array, or empty array if failed
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error getting all user ratings:', error);
      return [];
    }
  };

  // Delete a user's rating for a specific movie/TV show - NEW FUNCTION
  const deleteRating = async (mediaId) => {
    // If no user is logged in, return false
    if (!user) return false;
    
    try {
      // Get user's session token for authentication
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        console.error('No access token found');
        return false;
      }

      // Call our new DELETE endpoint
      const response = await fetch(`${API_URL}/api/ratings/${mediaId}`, {
        method: 'DELETE',                     // DELETE HTTP method
        headers: {
          'Authorization': `Bearer ${token}`  // Send token for authentication
        }
      });
      
      const data = await response.json();
      console.log('Delete rating response:', data);
      
      // Return true if successful, false if failed
      return data.success;
    } catch (error) {
      console.error('Error deleting rating:', error);
      return false;
    }
  };

  const value = {
    user,
    loading,
    getUserRating,
    submitRating,
    getAverageRating,
    getAllUserRatings,
    deleteRating             // Add new delete function to context
  };

  return (
    <RatingContext.Provider value={value}>
      {children}
    </RatingContext.Provider>
  );
};
