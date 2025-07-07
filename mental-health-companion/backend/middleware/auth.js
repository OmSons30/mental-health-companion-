const { supabase } = require('../config/supabase');

/**
 * Middleware to authenticate requests using Supabase JWT
 */
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Please provide a valid authentication token' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Authentication token is invalid or expired' 
      });
    }

    // Add user info to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      message: 'Internal server error during authentication' 
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (!error && user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next(); // Continue even if auth fails
  }
};

module.exports = {
  authenticateUser,
  optionalAuth
}; 