const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('./../controllers/authController');


router.post('/login', authController.login);
router.post('/signup', authController.signup);
// router.post('/forgotPassword', authController.forgotPassword);
// router.patch('/resetPassword/:token', authController.resetPassword);
// router.patch('/updateMyPassword', authController.updatePassword);
// router.patch('/updateMe', userController.updateMe);
router.get('logout', authController.logout);

// Protect all routes after this middleware
router.use(authController.protect);

router.delete('/deleteMe', userController.deleteMe);

// Only admin have permission to access for the below APIs 
router.use(authController.restrictTo('admin'));

router.route('/').get(userController.getAllUsers);


router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;