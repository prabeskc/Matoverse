const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

/**
 * Helper to standardise user + token response payload.
 */
const createAuthResponse = (session, profile) => ({
  token: session?.access_token || null,
  user: {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatar: profile.avatar,
    role: profile.role || 'user',
    phone: profile.phone || null,
    address: profile.address || null,
  },
});

// ─── Controller: POST /api/auth/signup ───────────────────────────────────────
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email, and password.', 400));
    }

    // 1. Create the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
    });

    if (error) {
      console.error('Supabase Signup Error:', error);
      return next(new AppError(error.message, 400));
    }

    if (!data.user) {
      return next(new AppError('Signup failed. Please try again.', 500));
    }

    // 2. Auto-confirm the user's email since email verification is enabled on Supabase project by default
    try {
      await supabase.auth.admin.updateUserById(data.user.id, {
        email_confirm: true,
      });
    } catch (confirmError) {
      console.error('Failed to auto-confirm email using admin API:', confirmError);
    }

    // 3. Log in to get a valid session token (since signUp session is null/empty for unconfirmed users)
    let sessionData = null;
    try {
      const loginResult = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });
      if (!loginResult.error) {
        sessionData = loginResult.data;
      } else {
        console.error('Post-signup login error:', loginResult.error);
      }
    } catch (loginError) {
      console.error('Post-signup login exception:', loginError);
    }

    // 4. Generate initial avatar & save user metadata to public 'profiles' table
    const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      name.trim()
    )}&backgroundColor=0d9488,14b8a6,0f766e`;

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      name: name.trim(),
      avatar,
    });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Even if profile sync fails, account is created. We will continue.
    }

    const profile = {
      id: data.user.id,
      name: name.trim(),
      email: data.user.email,
      avatar,
      phone: null,
      address: null,
    };

    res.status(201).json({
      status: 'success',
      message: `Welcome to Matoverse, ${profile.name}!`,
      ...createAuthResponse(sessionData?.session || data.session, profile),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Controller: POST /api/auth/login ────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password.', 400));
    }

    // 1. Authenticate credentials via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error) {
      console.error('Supabase Login Error:', error);
      // Use clean generic message to prevent account enumeration
      return next(new AppError('Incorrect email or password.', 401));
    }

    // 2. Get profile details from public database (including phone + address)
    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const profileName = profileData?.name || email.split('@')[0];
    const profileAvatar = profileData?.avatar || '';

    const profile = {
      id: data.user.id,
      name: profileName,
      email: data.user.email,
      avatar: profileAvatar,
      role: profileData?.role || 'user',
      phone: profileData?.phone || null,
      address: profileData?.address || null,
    };

    res.status(200).json({
      status: 'success',
      message: `Welcome back, ${profile.name}!`,
      ...createAuthResponse(data.session, profile),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Controller: GET /api/auth/me ────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    // req.user has been attached by the authMiddleware
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return next(new AppError('User profile details not found.', 404));
    }

    res.status(200).json({
      status: 'success',
      user: {
        id: req.user.id,
        name: profile.name,
        email: req.user.email,
        avatar: profile.avatar,
        role: profile.role || 'user',
        phone: profile.phone || null,
        address: profile.address || null,
        createdAt: req.user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Controller: PATCH /api/auth/profile ─────────────────────────────────────
// Protected — updates phone number and/or delivery address for the authenticated user
const updateProfile = async (req, res, next) => {
  try {
    const { phone, address } = req.body;

    // At least one field must be provided
    if (phone === undefined && address === undefined) {
      return next(new AppError('Please provide phone or address to update.', 400));
    }

    // Build the update object with only provided fields
    const updates = {};
    if (phone !== undefined) updates.phone = phone ? phone.trim() : null;
    if (address !== undefined) updates.address = address ? address.trim() : null;

    // Update the profiles table
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.userId)
      .select('*')
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return next(new AppError('Failed to update profile. Please try again.', 500));
    }

    console.log(`✅ [PROFILE UPDATE] User ${req.userId} updated profile:`, updates);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully.',
      user: {
        id: updatedProfile.id,
        name: updatedProfile.name,
        avatar: updatedProfile.avatar,
        phone: updatedProfile.phone || null,
        address: updatedProfile.address || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, getMe, updateProfile };
