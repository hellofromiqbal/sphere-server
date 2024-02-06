import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  username: {
    type: String,
    trim: true,
    required: true,
    unique: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
    unique: true
  },
  password: {
    type: String,
    minlength: 6,
    required: true
  },
  fullname: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: 'Hello there! I am using Sphere.'
  },
  about: {
    type: String
  },
  profileImage: {
    type: String,
    default: null
  },
  articles: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Article'
    }
  ],
  archives: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Article'
    }
  ],
  followers: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now()
    }
  }],
  following: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now()
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verifyEmailToken: String,
  verifyEmailTokenExpiryDate: Date,
  resetPasswordToken: String,
  resetPasswordTokenExpiryDate: Date,
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
