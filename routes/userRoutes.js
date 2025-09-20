const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('./../controllers/authController');
const passport = require('passport');


router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/forgotPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// router.patch('/updateMyPassword', authController.updatePassword);
// router.patch('/updateMe', userController.updateMe);
router.get('logout', authController.logout);

// Google OAuth routes
router.get('/google', authController.oauthGoogle); // Initiate Google OAuth
router.get('/google/callback', passport.authenticate("google", {
  failureRedirect: "/login", // Redirect if auth fails
  session: true, // Disable session (if using JWT)
}),authController.oauthGoogleCallback); // Google callback

// Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updateUser',userController.updateUser)
router.delete('/deleteMe', userController.deleteMe);

// Only admin have permission to access for the below APIs 

router.route('/').get(userController.getAllUsers);


router
.route('/profile')
.get(userController.getUser)
.delete(userController.deleteUser);
router.use(authController.restrictTo('admin'));

module.exports = router;