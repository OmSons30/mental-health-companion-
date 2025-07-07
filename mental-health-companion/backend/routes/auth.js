const express = require('express');
const { supabase } = require('../config/supabase');
const { validateSignup, validateLogin } = require('../middleware/validation');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', validateSignup, async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name
        }
      }
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return res.status(400).json({
        error: 'Registration failed',
        message: authError.message
      });
    }

    // Create profile record in profiles table
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email: email,
            full_name: full_name,
            created_at: new Date().toISOString()
          }
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Note: User is created in auth but profile creation failed
        // In production, you might want to handle this differently
      }
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
        full_name: full_name
      },
      session: authData.session
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to register user'
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return token
 * @access  Public
 */
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login error:', error);
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile?.full_name || data.user.user_metadata?.full_name
      },
      session: data.session
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to authenticate user'
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      return res.status(500).json({
        error: 'Logout failed',
        message: 'Failed to logout user'
      });
    }

    res.json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to logout user'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return res.status(404).json({
        error: 'Profile not found',
        message: 'User profile could not be retrieved'
      });
    }

    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        full_name: profile.full_name,
        created_at: profile.created_at
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch user profile'
    });
  }
});

module.exports = router; 