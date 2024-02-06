import express from 'express';
import { addArticleToUserArchive, addNewFollowing, deleteArticleFromUserArchive, deleteFollowing, readCurrentUser, readUser, signIn, signOut, signUp, updateUserProfile } from '../controllers/userController.js';

const router = express.Router();

// SIGN UP
router.post('/sign-up', signUp);
// SIGN IN
router.post('/sign-in', signIn);
// SIGN OUT
router.post('/sign-out', signOut);
// READ CURRENT USER
router.get('/me', readCurrentUser);
// READ USER BY USERNAME
router.get('/:username', readUser);
// UPDATE USER PROFILE BY ID
router.put('/update/profile/:id', updateUserProfile);
// ADD ARTICLE TO USER ARCHIVE BY ID
router.put('/update/archives/:id', addArticleToUserArchive);
// DELETE ARTICLE FROM USER ARCHIVE BY ID
router.delete('/update/archives/:id', deleteArticleFromUserArchive);
// ADD NEW FOLLOWING TO USER FOLLOWING BY ID
router.put('/update/following/:id', addNewFollowing);
// DELETE NEW FOLLOWING TO USER FOLLOWING BY ID
router.delete('/update/following/:id', deleteFollowing);

export default router;