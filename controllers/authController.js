import { generateToken } from "../utils/jwt.js";
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import passport from 'passport';
// Function to capitalize the first letter of a string
const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Handle Google OAuth Login Success
export const googleOAuthCallback = async (req, res, next) => {
  passport.authenticate(
    "google",
    { failureRedirect: "/login" },
    async (err, user, info) => {
      if (err) return next(err);

      if (user) {
        // Check if user is banned
        if (!user.isVerified) {
          return res.status(403).json({
            success: false,
            error: "Your account is banned. Please contact the administrator.",
          });
        }

        // ✅ Logged-in user (already in DB)
        await req.logIn(user, (err) => {
          if (err) return next(err);

          // 4. Generate JWT token
          const token = jwt.sign(
            {
              id: user._id,
              email: user.email,
              role: user.role,
              name: user.name,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
          );

          // 5. Prepare response with minimal user data and token
          const response = {
            token: token,
            user: {
              name: user.name,
              id: user._id,
              email: user.email,
              profileImage: user.profileImage,
              role: user.role,
            },
          };

          // 6. Send response (no redirect, just JSON with token and user data)
          return res.redirect(
            `${process.env.FRONTEND_URL
            }/oauth/callback?token=${token}&user=${JSON.stringify(
              response.user
            )}`
          );
        });
      } else if (info?.token) {
        // 🆕 New user - send token for onboarding
        return res.redirect(
          `${process.env.FRONTEND_URL}/select-role?token=${info.token}`
        );
      } else {
        // ❌ Unknown case
        return res.redirect("/login");
      }
    }
  )(req, res, next);
};

// Logout User
export const logoutUser = (req, res) => {
  req.logout(() => {
    res.status(200).json({ message: "User logged out" });
  });
};
export const verifyUser = (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    res.status(200).json({ message: "Token is valid", user: decoded });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export const completeServiceProvider = async (req, res) => {
  // 1️⃣ Validate request
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is missing' });
  }

  const { token, password, skills, location, experienceYears } = req.body;

  // Field validation
  const missingFields = {
    token: !token,
    password: !password,
    skills: !skills,
    location: !location,
    experienceYears: experienceYears === undefined
  };

  if (Object.values(missingFields).some(Boolean)) {
    return res.status(400).json({
      error: 'Missing required fields',
      missing: missingFields
    });
  }

  // 2️⃣ Verify JWT from Passport
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate expected payload structure
    if (!decoded?.email || !decoded?.name || decoded?.authMethod !== 'google') {
      throw new Error('Invalid token structure');
    }
  } catch (jwtErr) {
    return res.status(401).json({
      error: jwtErr.name === 'TokenExpiredError'
        ? 'Registration session expired - please reauthenticate with Google'
        : 'Invalid registration token',
      details: jwtErr.message
    });
  }

  // 3️⃣ Check for existing user (final safeguard)
  try {
    // More robust existence check
    const userCount = await User.countDocuments({ email: decoded.email }).exec();

    if (userCount > 0) {
      return res.status(409).json({
        error: 'Email already registered',
        solution: 'Try logging in instead'
      });
    }
  } catch (dbErr) {
    console.error('Database check failed:', {
      error: dbErr.message,
      stack: dbErr.stack,
      connectionState: mongoose.connection.readyState,
      collectionExists: await mongoose.connection.db.listCollections({ name: 'users' }).hasNext()
    });

    return res.status(503).json({
      error: 'Service unavailable',
      details: process.env.NODE_ENV === 'development' ? dbErr.message : undefined,
      // Include additional debug info:
      debug: {
        collection: 'users',
        query: { email: decoded.email },
        connection: mongoose.connection.readyState === 1 ? 'active' : 'inactive'
      }
    });
  }

  // 4️⃣ Create user
  try {
    const newUser = await User.create({
      name: decoded.name,
      email: decoded.email,
      profileImage: decoded.profileImage || 'default-profile.jpg',
      role: 'service_provider',
      password: await bcrypt.hash(password, 10),
      skills: typeof skills === 'string'
        ? skills.split(',').map(s => capitalizeFirstLetter(s.trim())).filter(Boolean)
        : skills.map(s => capitalizeFirstLetter(s)),
      location: {
        type: 'Point',
        coordinates: Array.isArray(location) ? location : JSON.parse(location)
      },
      experienceYears: Number(experienceYears),

    });

    // 5️⃣ Auto-login
    req.login(newUser, (loginErr) => {
      const userResponse = {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        image: newUser.image
      };

      if (loginErr) {
        console.error('Passport login failed:', loginErr);
        return res.status(201).json({
          success: true,
          message: 'Registration complete - please login',
          user: userResponse
        });
      }

      res.status(200).json({ success: true, user: userResponse });
    });

  } catch (err) {
    const errorResponse = {
      error: 'Registration failed',
      details: err.message
    };

    if (err.name === 'ValidationError') {
      errorResponse.validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(422).json(errorResponse);
    }

    res.status(500).json(errorResponse);
  }
};


// Complete Client Registration
export const completeClient = async (req, res) => {
  // 1️⃣ Validate request
  if (!req.body) {
    return res.status(400).json({ error: 'Request body is missing' });
  }

  const { token, password, location } = req.body;

  // Field validation
  const missingFields = {
    token: !token,
    password: !password,
    location: !location
  };

  if (Object.values(missingFields).some(Boolean)) {
    return res.status(400).json({
      error: 'Missing required fields',
      missing: missingFields
    });
  }

  // 2️⃣ Verify JWT from Passport
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.email || !decoded?.name || decoded?.authMethod !== 'google') {
      throw new Error('Invalid token structure');
    }
  } catch (jwtErr) {
    return res.status(401).json({
      error: jwtErr.name === 'TokenExpiredError'
        ? 'Registration session expired'
        : 'Invalid registration token',
      details: jwtErr.message
    });
  }

  // 3️⃣ Check for existing user
  try {
    const userCount = await User.countDocuments({ email: decoded.email }).exec();

    if (userCount > 0) {
      return res.status(409).json({
        error: 'Email already registered',
        solution: 'Try logging in instead'
      });
    }
  } catch (dbErr) {
    console.error('Database check failed:', {
      error: dbErr.message,
      connectionState: mongoose.connection.readyState
    });

    return res.status(503).json({
      error: 'Service unavailable',
      details: process.env.NODE_ENV === 'development' ? dbErr.message : undefined,
      // Include additional debug info:
      debug: {
        collection: 'users',
        query: { email: decoded.email },
        connection: mongoose.connection.readyState === 1 ? 'active' : 'inactive'
      }
    });
  }

  // 4️⃣ Create client
  try {
    const newUser = await User.create({
      name: decoded.name,
      email: decoded.email,
      profileImage: decoded.profileImage || 'default-client.jpg',
      role: 'client',
      password: await bcrypt.hash(password, 10),
      location: {
        type: 'Point',
        coordinates: Array.isArray(location) ? location : JSON.parse(location)
      }
    });

    // 5️⃣ Auto-login
    req.login(newUser, (loginErr) => {
      const userResponse = {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        image: newUser.image
      };

      if (loginErr) {
        console.error('Auto-login failed:', loginErr);
        return res.status(201).json({
          success: true,
          message: 'Registration complete - please login',
          user: userResponse
        });
      }

      res.status(200).json({ success: true, user: userResponse });
    });

  } catch (err) {
    const errorResponse = {
      error: 'Registration failed',
      details: err.message
    };

    if (err.name === 'ValidationError') {
      errorResponse.validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(422).json(errorResponse);
    }

    res.status(500).json(errorResponse);
  }
};



import { validationResult } from 'express-validator';  // MUST ADD THIS

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user with password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" }); // Changed error message
    }

    // Check if user is banned
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        error: "Your account is banned. Please contact the administrator.",
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" }); // Changed error message
    }

    // Generate JWT token with user's name
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Prepare response
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
    };

    // Send response
    return res.status(200).json({
      success: true,
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Authentication failed" });
  }
};