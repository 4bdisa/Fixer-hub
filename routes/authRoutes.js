import express from 'express';
import passport from '../config/passport.js';  // Import the passport configuration
import {
  completeServiceProvider,
  completeClient
} from '../controllers/authController.js';
import { authenticate } from "../middleWares/authMiddleware.js" // Import the authentication middleware
import { loginUser } from '../controllers/authController.js';
import jwt from 'jsonwebtoken'; // Import the JWT library

const router = express.Router();

// Route to initiate Google OAuth login
router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));
router.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', { failureRedirect: '/login' }, (err, user, info) => {
    if (err) return next(err);

    if (user) {
      // ✅ Logged-in user (already in DB)
      req.logIn(user, (err) => {
        if (err) return next(err);

        // 4. Generate JWT token
        const token = jwt.sign(
          { id: user._id, email: user.email, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // 5. Prepare response with minimal user data and token
        const response = {
          token: token,
          user: {
            id: user._id,
            email: user.email,
            profileImage: user.profileImage,
            role: user.role,
          },
        };

        // 6. Send response (no redirect, just JSON with token and user data)
        return res.redirect(`${process.env.FRONTEND_URL}/oauth/callback?token=${token}&user=${JSON.stringify(response.user)}`);
      });
    } else if (info?.token) {
      // 🆕 New user - send token for onboarding
      return res.redirect(`${process.env.FRONTEND_URL}/select-role?token=${info.token}`);
    } else {
      // ❌ Unknown case
      return res.redirect('/login');
    }
  })(req, res, next);
});

router.get("/verify", (req, res) => {
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
});



// Registration Completion Routes
router.post('/auth/complete/service-provider', completeServiceProvider);
router.post('/auth/complete/client', completeClient);
router.post('/login', loginUser);


router.get("/dashboard", authenticate, (req, res) => {
  res.json(req.user);
});


// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect(`${process.env.CLIENT_URL}/login`);
  });
});


export default router;

