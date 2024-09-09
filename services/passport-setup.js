const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const User = require('../models/user');
const Refresh = require('../models/refresh');
const jwtService = require('./jwt-service');
require('dotenv').config();

passport.use(
  new GoogleStrategy(
    {
      //options for staratagy
      callbackURL: 'api/v1/auth/callback',
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;
      const emailVerified = profile.emails[0].verified;

      if (!emailVerified) {
        return done(null, false, { message: 'Email not verified' });
      }

      try {
        const u = await User.findOne({ email });

        if (u) {
          const token = jwtService.generateToken(u);
          const refreshToken = jwtService.generateRefreshToken(u);

          const newRefresh = new Refresh({
            token: refreshToken,
          });
          await newRefresh.save();
          done(null, {
            user: u,
            accessToken: token,
            refreshToken: refreshToken,
          });
        } else {
          const newUser = new User({
            username: profile.name.givenName,
            email,
          });

          const user = await newUser.save();
          const token = jwtService.generateToken(user);
          const refreshToken = jwtService.generateRefreshToken(user);

          const newRefresh = new Refresh({
            token: refreshToken,
          });

          await newRefresh.save();

          done(null, {
            user,
            accessToken: token,
            refreshToken: refreshToken,
          });
        }
      } catch (e) {
        done(e, null);
      }
    }
  )
);
