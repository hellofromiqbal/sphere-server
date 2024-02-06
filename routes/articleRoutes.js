import express from 'express';
import { addResponseToArticle, createNewArticle, deleteArticle, deleteResponseFromArticle, editArticle, likeArticle, readAllArticles, readArticle, unlikeArticle } from '../controllers/articleController.js';

const router = express.Router();

// CREATE NEW ARTICLE
router.post('/', createNewArticle);
// READ ALL ARTICLES
router.get('/', readAllArticles);
// LIKE ARTICLE BY ID
router.put('/update/likes/:id', likeArticle);
// DELETE ARTICLE LIKE BY ID
router.delete('/update/likes/:id', unlikeArticle);
// ADD RESPONSE TO ARTICLE BY ID
router.put('/update/responses/:id', addResponseToArticle);
// DELETE RESPONSE FROM ARTICLE BY ID
router.delete('/update/responses/:id', deleteResponseFromArticle);
// READ ARTICLE BY ID
router.get('/:id', readArticle);
// DELETE ARTICLE BY ID
router.delete('/:id', deleteArticle);
// EDIT ARTICLE BY ID
router.put('/:id', editArticle);

export default router;