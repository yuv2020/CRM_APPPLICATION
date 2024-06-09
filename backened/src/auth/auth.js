const config = require('../config');
const providers = config.providers;
const helpers = require('../helpers');
const db = require('../db/models');

const passport = require('passport');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const UsersDBApi = require('../db/api/users');

passport.use(
  new JWTstrategy(
    {
      passReqToCallback: true,
      secretOrKey: config.secret_key,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    },
    async (req, token, done) => {
      try {
        const user = await UsersDBApi.findBy({ email: token.user.email });

        if (user && user.disabled) {
          return done(new Error(`User '${user.email}' is disabled`));
        }

        req.currentUser = user;

        return done(null, user);
      } catch (error) {
        done(error);
      }
    },
  ),
)