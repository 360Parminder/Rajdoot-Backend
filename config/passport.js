const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel"); // Adjust path as needed

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_DOMAIN}/api/v1/users/google/callback`,
      passReqToCallback: true, // Allows passing the `req` object to the callback
    },
    async (req, accessToken, refreshToken, profile, done) => {
        console.log("Google profile:", profile);
        
      try {
        // Check if user exists in DB
        let user = await User.findOne({ email: profile.emails[0].value });

      
        // If user doesn't exist, create a new one
        if (!user) {
          user = await User.create({
            email: profile.emails[0].value,
            name: profile.displayName,
            image: profile.photos[0].value,
            password: "GoogleOAuth", // Placeholder password
            passwordConfirm: "GoogleOAuth", // Placeholder password
            plan:{
             status: "active",
              plans:[
                {
                planId: "680c1693a129cbdb49d303c5", // Example plan ID
                startDate: Date.now(),
                expiryDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
                }
              ]
            },
            monthlyMessageLimit: 50,
            messageCount: 0,
          });
        }
          if(user?.image!=profile.photos[0].value){
          // Update user image if it has changed
          user.image = profile.photos[0].value;
          await user.save();
        }


        // Return the user
        done(null, user);

      } catch (err) {
        done(err, null);
      }
    }
  )
);

// Serialize/Deserialize User (required for session management)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});