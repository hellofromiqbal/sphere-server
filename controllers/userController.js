import { User } from '../models/userModel.js';
import { Article } from '../models/articleModel.js';
import { hasSpecialCharacters } from '../helper/specialCharDetector.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_TOKEN = process.env.SECRET_TOKEN;

export const signUp = async (request, response) => {
  try {
    if (!request.body.fullname || !request.body.email || !request.body.password) {
      return response.status(400).send({ message: 'Please fulfill the form.' });
    };

    // Check if email already exist
    const isEmailExist = await User.findOne({ email: request.body.email });
    if(isEmailExist) {
      return response.status(400).send({ message: 'Email already binded with existing account.' });
    };

    // Password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(request.body.password, salt);

    // Create default username
    const defaultUsername = '@user' + salt.slice(-10).replace(/[&\/\\#,+()$~%.'":*?<>{}]/g);

    const newUserData = {
      username: defaultUsername,
      email: request.body.email,
      password: hashedPassword,
      fullname: request.body.fullname,
    };

    await User.create(newUserData);
    return response.send({ message: 'New account created successfully!' });
  } catch (error) {
    console.log(error.message);
    return response.status(500).send({ message: error.message });
  };
};

export const signIn = async (request, response) => {
  try {
    if(!request.body.email || !request.body.password) {
      return response.status(400).send({ message: 'Please fulfill the form.' });
    };
    
    // Check if the user exist by email and inputted password correct
    const isUserExist = await User.findOne({ email: request.body.email });
    const isPasswordCorrect = await bcrypt.compare(request.body.password, isUserExist.password);
    if(!isUserExist || !isPasswordCorrect) {
      return response.status(400).send({ message: 'Invalid email or password.' });
    };

    // JWT Token preparation & injection to cookie
    const tokenPayload = {
      userId: isUserExist._id,
      username: isUserExist.username,
      email: isUserExist.email,
      fullname: isUserExist.fullname
    };
    const userSignInToken = jwt.sign(tokenPayload, SECRET_TOKEN, { expiresIn: '7d' });
    response.cookie('sphere', userSignInToken, { httpOnly: true, path: '/' });

    return response.json({
      message: 'Signed in successfully.',
      data: isUserExist
    });
  } catch (error) {
    console.log(error.message);
    return response.status(500).send({ message: error.message });
  };
};

export const signOut = async (request, response) => {
  try {
    response.clearCookie('sphere', { httpOnly: true });
    return response.json({ message: 'Signed out successfully!' });
  } catch (error) {
    console.log(error.message);
    return response.status(500).send({ message: error.message });
  };
};

export const readCurrentUser = async (request, response) => {
  try {
    const { sphere } = request.cookies;
    if(!sphere) {
      return response.json({
        message: 'Unauthorized.',
        data: sphere
      });
    };

    const decodedToken = jwt.verify(sphere, process.env.SECRET_TOKEN);

    const currentUser = await User.findById(decodedToken.userId).populate({
      path: 'following',
      populate: {
        path: 'user',
        model: 'User'
      }
    }).populate({
      path: 'followers',
      populate: {
        path: 'user',
        model: 'User'
      }
    });
    if(!currentUser) {
      return response.status(404).send({ message: 'User not found.' });
    };

    return response.json({
      message: 'User is signing in.',
      data: currentUser
    });
  } catch (error) {
    console.log(error.message);
    return response.status(500).send({ message: error.message });
  };
};

export const readUser = async (request, response) => {
  try {
    const { username } = request.params;
    const isUserExist = await User.findOne({ username }).populate('articles').populate('archives').populate({
      path: 'following',
      populate: {
        path: 'user',
        model: 'User'
      }
    }).populate({
      path: 'followers',
      populate: {
        path: 'user',
        model: 'User'
      }
    });
    if(!isUserExist) {
      return response.status(404).send({ message: 'User not found.' });
    };
    return response.json({
      message: 'User found.',
      data: isUserExist
    });
  } catch (error) {
    console.log(error.message);
    return response.status(500).send({ message: error.message });
  };
};

export const updateUserProfile = async (request, response) => {
  try {
    const { id } = request.params;
    const isUserExist = await User.findById(id);
    if(!isUserExist) {
      return response.status(404).json({ message: 'User not found.' });
    };

    let { username, fullname, bio, about } = request.body;

    const containSpecialChars = hasSpecialCharacters(username);
    if(containSpecialChars) {
      return response.status(400).send({ message: 'Username cannot contain special characters!' });
    };

    username = '@' + username;

    const isUsernameAlreadyTaken = await User.findOne({ username });
    if(isUsernameAlreadyTaken) {
      return response.status(400).send({ message: 'Username already taken.' });
    };
    
    const updatedUser = await User.findByIdAndUpdate(id, { username, fullname, bio, about }, { new: true });
    
    return response.json({
      message: 'Profile updated.',
      data: updatedUser
    });
  } catch (error) {
    console.log(error.message);
    return response.status(500).send({ message: error.message });
  };
};

export const addArticleToUserArchive = async (request, response) => {
  try {
    const { id } = request.params;
    const isUserExist = await User.findById(id);
    if(!isUserExist) {
      return response.status(404).send({ message: 'User not found.' });
    };

    const articleId = request.body.articleId;
    const isArticleExist = await Article.findById(articleId);
    if(!isArticleExist) {
      return response.status(404).send({ message: 'Article not found.' });
    };

    isUserExist.archives.push(articleId);
    isUserExist.save();
    return response.json({ message: 'Article archived.' });
  } catch (error) {
    console.log(error.message);
    return response.status(500).send({ message: error.message });
  };
};

export const deleteArticleFromUserArchive = async (request, response) => {
  try {
    const { id } = request.params;
    const isUserExist = await User.findById(id);
    if(!isUserExist) {
      return response.status(404).send({ message: 'User not found.' });
    };

    const articleId = request.body.articleId;
    const isArticleExist = await Article.findById(articleId);
    if(!isArticleExist) {
      return response.status(404).send({ message: 'Article not found.' });
    };

    isUserExist.archives.pull(articleId);

    isUserExist.save();
    return response.json({ message: 'Article unarchived.' });
  } catch (error) {
    console.log(error.message);
    return response.status(500).send({ message: error.message });
  };
};

export const addNewFollowing = async (request, response) => {
  try {
    const { id } = request.params;
    const isUserExist = await User.findById(id);
    if(!isUserExist) {
      return response.status(404).send({ message: 'User not found.' });
    };

    const { currentUserId } = request.body;
    const isFollowerAnExistingUser = await User.findById(currentUserId);
    if(!isFollowerAnExistingUser) {
      return response.status(404).send({ message: 'User not found.' });
    };
    
    isFollowerAnExistingUser.following.unshift({ user: id });
    isFollowerAnExistingUser.save();
    
    isUserExist.followers.unshift({ user: currentUserId });
    isUserExist.save();

    return response.json({ message: 'Followed.' });
  } catch (error) {
    console.log(error.message);
    return response.status(500).send({ message: error.message });
  };
};

export const deleteFollowing = async (request, response) => {
  try {
    const { id } = request.params;
    const isUserExist = await User.findById(id);
    if(!isUserExist) {
      return response.status(404).send({ message: 'User not found.' });
    };

    const { currentUserId } = request.body;
    const isFollowerAnExistingUser = await User.findById(currentUserId);
    if(!isFollowerAnExistingUser) {
      return response.status(404).send({ message: 'User not found.' });
    };

    isFollowerAnExistingUser.following.pull({ user: { _id: id } });
    isFollowerAnExistingUser.save();

    isUserExist.followers.pull({ user: { _id: currentUserId } });
    isUserExist.save();

    return response.json({ message: 'Unfollowed.' });
  } catch (error) {
    console.log(error.message);
    return response.status(500).send({ message: error.message });
  }
};