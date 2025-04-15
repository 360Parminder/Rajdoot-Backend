const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const { sendRegistrationEmail, sendForgetPasswordEmail, sendPasswordResetConfirmationEmail } = require("../utils/mailTemplates");
const crypto = require('crypto');


// function to create token
const createToken = id => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );
};

// function to create forget password reset token
const createPasswordResetToken = async (userId) => {
  // 1) Create random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // 2) Hash the token and save to database
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // 3) Set expiration (e.g., 10 minutes)
  const tokenExpiration = Date.now() + 10 * 60 * 1000;
  
  // In your User model, you should have these fields:
  // passwordResetToken: String,
  // passwordResetExpires: Date
  
  // Save to user document
 await User.findByIdAndUpdate(userId, {
    passwordResetToken: hashedToken,
    passwordResetExpires: tokenExpiration
  });
  
  return resetToken; // Return the unhashed token for the email
};




exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) check if email and password exist
    if (!email || !password) {
      return next(
        new AppError(404, "fail", "Please provide email or password"),
        req,
        res,
        next,
      );
    }

    // 2) check if user exist and password is correct
    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(
        new AppError(401, "fail", "Email or Password is wrong"),
        req,
        res,
        next,
      );
    }

    // 3) All correct, send jwt to client
    const token = createToken(user.id);

    // Remove the password from the output
    user.password = undefined;

    res.status(200).json({
      status: "success",
      token,
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.signup = async (req, res, next) => {
  try {
    // 1) check if email and password exist 
    if (!req.body.email || !req.body.password) {
      return next(
        new AppError(404, "fail", "Please provide email or password"),
        req,
        res,
        next,
      );
    }
    // 2) check if user exist
    const userExist = await User.findOne({
      email: req.body.email,
    });
    if (userExist) {
      return next(
        new AppError(409, "fail", "This email is already exist"),
        req,
        res,
        next,
      );
    }
    // 3) check if password and passwordConfirm are same
    if (req.body.password !== req.body.passwordConfirm) {
      return next(
        new AppError(400, "fail", "Password and PasswordConfirm are not same"),
        req,
        res,
        next,
      );
    }
    // 4) check if role is exist
    const roles = ["admin", "developer","tester","user"];
    if (!req.body.role || !roles.includes(req.body.role)) {
      return next(
        new AppError(400, "fail", "Role is not valid"),
        req,
        res,
        next,
      );
    }
    // 5) check if the mail contains developer,tester,test,admin,user,password
    const regex = /(developer|tester|test|admin|user|password)/;
    if (regex.test(req.body.email)) {
      return next(
        new AppError(400, "fail", "Email contains reserved words"),
        req,
        res,
        next,
      );
    }
    // 6) check if the password contains developer,tester,test,admin,user,password
    const regexPassword = /(developer|tester|test|admin|user|password)/;
    if (regexPassword.test(req.body.password)) {
      return next(
        new AppError(400, "fail", "Password contains reserved words"),
        req,
        res,
        next,
      );
    }
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
    });

    const token = createToken(user.id);
    user.password = undefined;
    user.passwordConfirm = undefined;
    // 7) update the user subcription for the first time for 7 days
   const updatedUser  = await User.findByIdAndUpdate(user.id,{
    plan:{
      status: "active",
      plans:[
        {
          planId: "646f2b0c1a4d3e2f8c5b8e7d",
          startDate: new Date(),
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        }
      ]
    },
    monthlyMessageLimit: 50,
  })
    // 8) check if the user is updated
    if (!updatedUser) {
      return next(
        new AppError(404, "fail", "User not found"),
        req,
        res,
        next,
      );
    }
    // 9) send welcome email with nodemailer 
    await sendRegistrationEmail(user.name, user.email);

    res.status(201).json({
      status: "success",
      token,
      user: updatedUser,
    });
  } catch (err) {
    console.log(err);
    
    return next(new AppError(500, "fail", "Internal server error"), req, res, next);
  }
};

exports.protect = async (req, res, next) => {
  try {
    // 1) check if the token is there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(
        new AppError(
          401,
          "fail",
          "You are not logged in! Please login in to continue",
        ),
        req,
        res,
        next,
      );
    }

    // 2) Verify token
    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) check if the user is exist (not deleted)
    const user = await User.findById(decode.id);
    if (!user) {
      return next(
        new AppError(401, "fail", "This user is no longer exist"),
        req,
        res,
        next,
      );
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
exports.logout = (req, res, next) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    data: null,
    message: "Logged out successfully",
  });
};

exports.forgetPassword = async (req, res, next) => {
  console.log("Forget password called",req);
  
  try {
    // 1) check if email is there
    const { email } = req.body;
    if (!email) {
      return next(
        new AppError(404, "fail", "Please provide email"),
        req,
        res,
        next,
      );
    }
    // 2) check if user exist
    const user = await User.findOne({
      email,
    });
    if (!user) {
      return next(
        new AppError(404, "fail", "This email is not registered"),
        req,
        res,
        next,
      );
    }
    // 3) send reset password link
    const resetToken = await createPasswordResetToken(user._id);
    await user.save({ validateBeforeSave: false });
    const resetURL = `${req.origin}://${req.get(
      "host",
    )}/reset-password/${resetToken}`;

    // 4) send email
    await sendForgetPasswordEmail(
      user.name,
      user.email,
      resetURL,
    );
    res.status(200).json({
      status: "success",
      message: "Reset password link sent to your email",
    });
  } catch (err) {
    next(new AppError(500, "fail", "Internal server error"), req, res, next);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // 1) Get token from URL params
    const resetToken = req.params.token;
    
    // 2) Hash the token to compare with stored hashed token
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // 3) Find user with matching token and check expiration
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return next(
        new AppError(400, "fail", "Token is invalid or has expired"),
        req,
        res,
        next
      );
    }
    
    // 4) Update password and clear reset token fields
    const { password, passwordConfirm } = req.body;
    
    if (!password || !passwordConfirm) {
      return next(
        new AppError(400, "fail", "Please provide password and password confirmation"),
        req,
        res,
        next
      );
    }
    
    if (password !== passwordConfirm) {
      return next(
        new AppError(400, "fail", "Passwords do not match"),
        req,
        res,
        next
      );
    }
    
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    // 5) Optionally: Send confirmation email
    await sendPasswordResetConfirmationEmail(
      user.name,
      user.email,
    );
    
    res.status(200).json({
      status: "success",
      message: "Password updated successfully"
    });
    
  } catch (err) {
    console.log(err);
    next(new AppError(500, "fail", "Internal server error"), req, res, next);
  }
};


// Authorization check if the user have rights to do this action
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(403, "fail", "You are not allowed to do this action"),
        req,
        res,
        next,
      );
    }
    next();
  };
};
