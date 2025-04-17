import express from 'express';
import passport from '../config/passport.js';  // Import the passport configuration
import {
    completeServiceProvider,
    completeClient
  } from '../controllers/authController.js';
  import { ensureAuth } from "../middlewares/authMiddleware.js";
import { loginUser } from '../controllers/authController.js';

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
        
        
        return res.redirect(`${process.env.FRONTEND_URL}/dashboard`) ;
      });
    } else if (info?.token) {
      // 🆕 New user - redirect frontend with token to continue onboarding
      return res.redirect(`${process.env.FRONTEND_URL}/select-role?token=${info.token}`);
    } else {
      // ❌ Unknown case
      return res.redirect('/login');
    }
  })(req, res, next);
});




router.get("/verify", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
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

// routes/protected.js

// Registration Completion Routes
router.post('/auth/complete/service-provider', completeServiceProvider);
router.post('/auth/complete/client', completeClient);
router.post('/login',  loginUser);


router.get("/dashboard", ensureAuth, (req, res) => {
  res.json(req.user);
});


// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect(`${process.env.CLIENT_URL}/login`);
  });
});


export default router;

