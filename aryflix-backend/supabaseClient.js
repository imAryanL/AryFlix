/*
=== BACKEND SUPABASE CLIENT ===

This is the BACKEND version of the Supabase connection (Node.js server side).

DIFFERENCE FROM FRONTEND VERSION:
- Frontend supabaseClient.js → Used by React components (import/export)
- Backend supabaseClient.js → Used by Node.js server (require/module.exports)

WHAT IT DOES:
1. Connects Node.js server to Supabase database
2. Provides verifyUser() function to check if user tokens are valid

USED BY:
- server.js → Watchlist API endpoints (/api/watchlist)
- authSecurity.js → Token verification for protected routes

WHY YOU NEED BOTH FILES:
- Frontend file = React app talks to database directly
- Backend file = Node.js server talks to database for API calls

WITHOUT THIS FILE:
❌ Watchlist API endpoints won't work
❌ User authentication on server won't work
✅ Keep this file - your backend needs it!
*/


// Use require instead of import (CommonJS style)
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Service role key for database operations (bypasses RLS)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Regular client for auth verification
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for database operations (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Simple function to check if a user's token is valid
const verifyUser = async (token) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error checking token:', error);
    return null;
  }
};

// Use module.exports instead of export (CommonJS style)
module.exports = {
  supabase,
  supabaseAdmin, // Use this for database operations
  verifyUser
};