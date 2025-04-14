import express from 'express';
import passport from '../config/passport.js';  // Import the passport configuration
import {
    completeServiceProvider,
    completeClient
  } from '../controllers/authController.js';
  import { ensureAuth } from "../middlewares/authMiddleware.js";


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
        return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
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

// routes/protected.js

// Registration Completion Routes
router.post('/auth/complete/service-provider', completeServiceProvider);
router.post('/complete/client', completeClient);


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

