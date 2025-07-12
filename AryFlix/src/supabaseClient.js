/*
=== SUPABASE CLIENT & AUTHENTICATION HELPER ===

This file is the "communication center" between your AryFlix app and the Supabase database.

WHAT IT DOES:
1. Creates connection to Supabase database (supabase client)
2. Provides helper functions for user authentication (authFunctions)

USED BY:
- Login/Signup pages → Create accounts, log users in/out
- Navbar → Show username, logout button  
- WatchlistContext → Save/load user's watchlist data
- Any component that needs database access

WITHOUT THIS FILE:
❌ No user accounts, no login, no watchlist saving
✅ Keep this file - it's essential!

*/

// Import Supabase client for frontend
import { createClient } from '@supabase/supabase-js';

// Your Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simple authentication functions
export const authFunctions = {
  // Sign up new user - SIMPLE DATABASE APPROACH
  signUp: async (email, password, username) => {
    try {
      // Step 1: Check if username already exists in our table
      const { data: existingUsername, error: checkError } = await supabase
        .from('usernames')
        .select('username')
        .eq('username', username.toLowerCase())
        .single();
      
      // If we found a username, it's taken
      if (existingUsername) {
        return { 
          data: null, 
          error: { message: 'Username already taken. Please choose a different one.' }
        };
      }
      
      // Step 2: Username is available, create the account
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username
          }
        }
      });
      
      // Step 3: If account created successfully, save username to our table
      if (data && !error) {
        await supabase
          .from('usernames')
          .insert([{ username: username.toLowerCase() }]);
      }
      
      // Handle email already exists error
      if (error && error.message.includes('already registered')) {
        return { 
          data: null, 
          error: { message: 'Email already exists. Please use a different email or try logging in.' }
        };
      }
      
      return { data, error };
      
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        data: null, 
        error: { message: 'Something went wrong. Please try again.' }
      };
    }
  },

  // Sign in existing user
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });
    return { data, error };
  },

  // Sign out user
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current session/token
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  }
}; 