const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please fill your name"],
  },
  email: {
    type: String,
    required: [true, "Please fill your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, " Please provide a valid email"],
  },
  address: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Please fill your password"],
    minLength: 6,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: function() {
      return this.isNew || this.isModified('password');
    },
    validate: {
      validator: function(el) {
        return this.isNew || this.isModified('password') ? el === this.password : true;
      },
      message: "Passwords do not match"
    }
  },
  role: {
    type: String,
    enum: ["admin", "developer","tester","user"],
    default: "user",
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  plan: {
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    plans: [
      {
        planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
        },
        startDate: {
          type: Date,
          default: Date.now,
        },
        expiryDate: {
          type: Date,
          default: Date.now,
        },

      },
    ]
  },
  
  monthlyMessageLimit: {
    type: Number,
    default: 0,
  },
  messageCount: {
    type: Number,
    default: 0,
  },
});

// encrypt the password using 'bcryptjs'
// Mongoose -> Document Middleware
userSchema.pre("save", async function(next) {
  // check the password if it is modified
  if (!this.isModified("password")) {
    return next();
  }

  // Hashing the password
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

// This is Instance Method that is gonna be available on all documents in a certain collection
userSchema.methods.correctPassword = async function(
  typedPassword,
  originalPassword,
) {
  return await bcrypt.compare(typedPassword, originalPassword);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
