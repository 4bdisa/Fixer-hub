import express from 'express';
import passport from '../config/passport.js';  // Import the passport configuration
import { completeServiceProvider, completeClient } from '../controllers/authController.js';
import { authenticate } from "../middleWares/authMiddleware.js" // Import the authentication middleware
import { loginUser } from '../controllers/authController.js';
import { googleOAuthCallback } from '../controllers/authController.js'; // Import the Google OAuth callback function
import jwt from 'jsonwebtoken'; // Import the JWT library
import { verifyUser } from '../controllers/authController.js'; // Import the verifyUser function
const router = express.Router();

// Route to initiate Google OAuth login
router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get("/auth/google/callback",googleOAuthCallback);

router.get("/verify", verifyUser);



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

