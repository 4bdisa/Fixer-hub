import express from 'express';
import passport from '../config/passport.js';  // Import the passport configuration
import {
    completeServiceProvider,
    completeClient
  } from '../controllers/authController.js';
  import { ensureAuth } from "../middleWares/authMiddleware.js";

const router = express.Router();

// Route to initiate Google OAuth login
router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

// routes/protected.js


router.get("/dashboard", ensureAuth, (req, res) => {
  res.json(req.user);
});


// Registration Completion Routes
router.post('/complete/service-provider', completeServiceProvider);
router.post('/complete/client', completeClient);

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect(`${process.env.CLIENT_URL}/login`);
  });
});


export default router;

