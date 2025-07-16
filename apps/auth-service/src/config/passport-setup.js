const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userService = require('../services/user.service');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Comprobar si ya existe un usuario con este ID de Google
        let user = await userService.findUserByGoogleId(profile.id);

        if (user) {
          // El usuario ya existe, proceder
          return done(null, user);
        }

        // 2. Si no existe, comprobar si hay una cuenta con ese email
        user = await userService.findUserByEmailOrUsername(profile.emails[0].value, null);
        
        if (user) {
          // El usuario existe pero no ha usado Google. Lo vinculamos.
          const updatedUser = await userService.updateUserById(user.id, {
            google_id: profile.id,
            avatar_url: profile.photos[0].value,
          });
          return done(null, updatedUser);
        }

        // 3. El usuario no existe. Creamos uno nuevo.
        const newUser = await userService.createUser({
          google_id: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
          is_verified: true, // Se considera verificado al venir de Google
          avatar_url: profile.photos[0].value,
        });

        return done(null, newUser);

      } catch (error) {
        return done(error, null);
      }
    }
  )
);