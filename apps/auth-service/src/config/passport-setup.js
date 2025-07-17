const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const userService = require('../services/user.service');

// --- ESTRATEGIA DE GOOGLE MODIFICADA ---
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      proxy: true,
      passReqToCallback: true, // <-- 1. AÑADIDO: Permite pasar 'req' al callback
    },
    // 2. AÑADIDO: 'req' como primer parámetro
    async (req, accessToken, refreshToken, profile, done) => { 
      try {
        // 3. AÑADIDO: Lógica para vincular cuenta si el usuario ya está logueado
        if (req.user) {
          const updatedUser = await userService.updateUserById(req.user.id, {
            google_id: profile.id,
            avatar_url: profile.photos[0].value,
          });
          return done(null, updatedUser);
        }

        // Lógica existente para login/registro
        let user = await userService.findUserByGoogleId(profile.id);
        if (user) {
          return done(null, user);
        }
        user = await userService.findUserByEmailOrUsername(profile.emails[0].value, null);
        if (user) {
          const updatedUser = await userService.updateUserById(user.id, {
            google_id: profile.id,
            avatar_url: profile.photos[0].value,
          });
          return done(null, updatedUser);
        }
        const newUser = await userService.createUser({
          google_id: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
          is_verified: true,
          avatar_url: profile.photos[0].value,
        });
        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// --- ESTRATEGIA DE FACEBOOK MODIFICADA ---
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: '/api/auth/facebook/callback',
      proxy: true,
      profileFields: ['id', 'displayName', 'emails', 'photos'],
      passReqToCallback: true, // <-- 1. AÑADIDO
    },
    // 2. AÑADIDO: 'req' como primer parámetro
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // 3. AÑADIDO: Lógica para vincular cuenta si el usuario ya está logueado
        if (req.user) {
          const updatedUser = await userService.updateUserById(req.user.id, {
            facebook_id: profile.id,
            avatar_url: profile.photos ? profile.photos[0].value : req.user.avatar_url,
          });
          return done(null, updatedUser);
        }
        
        // Lógica existente para login/registro
        let user = await userService.findUserByFacebookId(profile.id);
        if (user) {
          return done(null, user);
        }
        user = await userService.findUserByEmailOrUsername(profile.emails[0].value, null);
        if (user) {
          const updatedUser = await userService.updateUserById(user.id, {
            facebook_id: profile.id,
            avatar_url: profile.photos ? profile.photos[0].value : user.avatar_url,
          });
          return done(null, updatedUser);
        }
        const newUser = await userService.createUser({
          facebook_id: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
          is_verified: true,
          avatar_url: profile.photos ? profile.photos[0].value : null,
        });
        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);