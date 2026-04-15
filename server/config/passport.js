import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";

export const setupGoogleStrategy = () => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback" // ← Correct backend route
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Pehle email se check karo
      let user = await User.findOne({ email: profile.emails?.[0]?.value });

      if (!user) {
        // Agar user nahi hai, tabhi create karo
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          isVerified: true,
        });
      } else {
        // Agar user pehle se hai, usi ko use karo (login)
        if (!user.googleId) {
          // Agar pehle normal signup hua tha, GoogleId update kar do
          user.googleId = profile.id;
          await user.save();
        }
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
};
