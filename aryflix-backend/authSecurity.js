// Import our Supabase functions
const { verifyUser } = require('./supabaseClient');

// Simple middleware to check if user is logged in
const requireAuth = async (req, res, next) => {
  try {
    // Get the token from the request headers
    // Frontend will send it like: Authorization: Bearer abc123token
    const authHeader = req.headers.authorization;
    
    // Check if token exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided. Please log in.'
      });
    }
    
    // Extract just the token part (remove "Bearer ")
    const token = authHeader.replace('Bearer ', '');
    
    // Ask Supabase: "Is this user logged in?"
    const user = await verifyUser(token);
    
    // If no user found, token is invalid
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. Please log in again.'
      });
    }
    
    // Token is valid add user info to request
    // other functions can access req.user
    req.user = user;
    
    // Continue to the next function
    next();

    
  } catch (error) {
    console.error('Auth security error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

// Export the security function
module.exports = { requireAuth };
