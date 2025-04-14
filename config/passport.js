import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import dotenv from 'dotenv';

dotenv.config();
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  scope: ["profile", "email"]
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const { email, name, picture } = profile._json;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // ✅ User exists, continue login
      return done(null, existingUser);
    }

    // 🚧 New user — don’t save yet, just pass token to frontend
    const tempUserPayload = {
      email,
      name,
      profileImage: picture,
      authMethod: 'google'
    };

    // 🔐 Token lasts 10 minutes
    const token = jwt.sign(tempUserPayload, process.env.JWT_SECRET, { expiresIn: '40m' });

    // 👇 We pass 'false' to skip login and attach info
    return done(null, false, { message: 'new_user', token });

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