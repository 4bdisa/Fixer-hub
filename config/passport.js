import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL, // Must match Google Cloud
  scope: ["profile", "email"]
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const { email, name, picture } = profile._json;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return done(null, existingUser);
    }

    // Create temporary token for new users
    const tempUser = {
      email,
      name,
      profileImage: picture,
      authMethod: 'google'
    };

    const token = jwt.sign(tempUser, process.env.JWT_SECRET, { 
      expiresIn: '10m' 
    });

    return done(null, false, { token });

  } catch (err) {
    return done(err, false);
  }
}));

// Session management
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;