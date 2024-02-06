import { Article } from '../models/articleModel.js';
import { User } from '../models/userModel.js';

export const createNewArticle = async(request, response) => {
  try {
    const { authorId, title, summary, content } = request.body;
    if(!authorId || !title || !summary || !content) {
      return response.status(400).send({ message: 'Cannot create article.' });
    };

    const isUserExist = await User.findById(authorId);
    if(!isUserExist) {
      return response.status(404).send({ message: 'User not found.' });
    };

    const newArticle = await Article.create({
      author: authorId,
      title,
      summary,
      content
    });

    isUserExist.articles.push(newArticle._id);
    isUserExist.save();
    
    return response.json({
      message: 'Article posted.',
      data: newArticle
    });
  } catch (error) {
    console.log(error.message);
    return response.status(500).send({ message: error.message });
  };
};

export const readAllArticles = async (request, response) => {
  try {
    const articles = await Article.find().populate('author').populate('likes');
    return response.json({
      message: 'All articles fetched.',
      data: articles.reverse()
    });
  } catch (error) {
    console.log(error.message);
    return response.status(500).send({ message: error.message });
  };
};

export const likeArticle = async (request, response) => {
  try {
    const { id } = request.params;
    const isArticleExist = await Article.findById(id);
    if(!isArticleExist) {
      return response.status(404).send({ message: 'Article not found.' });
    };

    const currentUserId = request.body.currentUserId;
    const isUserExist = await User.findById(currentUserId);
    if(!isUserExist) {
      return response.status(404).send({ message: 'User not found.' });
    };

    isArticleExist.likes.push(currentUserId);
    isArticleExist.save();
    return response.json({ message: 'Article liked.' });
  } catch (error) {
    console.log(error.message);
    return response.status(500).send({ message: error.message });
  };
};

export const unlikeArticle = async (request, response) => {
  try {
    const { id } = request.params;
    const isArticleExist = await Article.findById(id);
    if(!isArticleExist) {
      return response.status(404).send({ message: 'Article not found.' });
    };

    const currentUserId = request.body.currentUserId;
    const isUserExist = await User.findById(currentUserId);
    if(!isUserExist) {
      return response.status(404).send({ message: 'Article not found.' });
    };

    isArticleExist.likes.pull(currentUserId);
    isArticleExist.save();

    return response.json({ message: 'Article unliked.' });
  } catch (error) {
    console.log(error.message);
    return response.status(500).send({ message: error.message });
  };
};

export const addResponseToArticle = async (request, response) => {
  try {
    const { id } = request.params;
    const isArticleExist = await Article.findById(id);
    if(!isArticleExist) {
      return response.status(404).send({ message: 'Article not found.' });
    };

    const { currentUserId, text } = request.body;
    const isUserExist = await User.findById(currentUserId);
    if(!isUserExist) {
      return response.status(404).send({ message: 'User not found.' });
    };

    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      { $push: { responses: { user: currentUserId, text } } },
      { new: true }
    ).populate({
      path: 'responses',
      populate: {
        path: 'user',
        model: 'User'
      }
    });
    return response.json({
      message: 'Article responded.',
      data: updatedArticle
    });
  } catch (error) {
    console.log(error.message);
    return response.status(500).send({ message: error.message });
  };
};

export const deleteResponseFromArticle = async (request, response) => {
  try {
    const { id } = request.params;
    const isArticleExist = await Article.findById(id);
    if(!isArticleExist) {
      return response.status(404).send({ message: 'Article not found.' });
    };

    const { currentUserId, currentResponseId } = request.body;
    const isUserExist = await User.findById(currentUserId);
    if(!isUserExist) {
      return response.status(404).send({ message: 'User not found.' });
    };

    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      { $pull: { responses: { _id: currentResponseId } } },
      { new: true }
    );
    return response.json({
      message: 'Response deleted.',
      data: updatedArticle
    });
  } catch (error) {
    console.log(error.message);
    return response.status(500).send({ message: error.message });
  };
};

export const readArticle = async (request, response) => {
  try {
    const { id } = request.params;
    const article = await Article.findById(id).populate('author').populate({
      path: 'responses',
      populate: {
        path: 'user',
        model: 'User'
      }
    });
    if(!article) {
      return response.status(404).send({ message: 'Article not found.' });
    };
    return response.json({
      message: 'Article found.',
      data: article
    });
  } catch (error) {
    console.log(error.message);
    return response.status(500).send({ message: error.message });
  };
};

export const deleteArticle = async (request, response) => {
  try {
    const { id } = request.params;
    const isArticleExist = await Article.findByIdAndDelete(id);
    if(!isArticleExist) {
      return response.status(404).send({ message: 'Article not found.' });
    };

    const { currentUserId } = request.body;
    const isUserExist = await User.findById(currentUserId);
    if(!isUserExist) {
      return response.status(404).send({ message: 'User not found.' });
    };

    isUserExist.articles.pull(id);
    isUserExist.save();

    await User.updateMany(
      { 'archives': id },
      { $pull: { 'archives': id } }
    )

    await Article.findByIdAndDelete(id);
    return response.send({ message: 'Article deleted.' });
  } catch (error) {
    console.log(error.message);
    return response.status(500).send({ message: error.message });
  };
};

export const editArticle = async (request, response) => {
  try {
    const { id } = request.params;
    const isArticleExist = await Article.findById(id);
    if(!isArticleExist) {
      return response.status(404).send({ message: 'Article not found.' });
    };

    const { title, summary, content } = request.body;
    if(!title || !summary || !content) {
      return response.status(400).send({ message: 'Please fulfill the form.' });
    };

    await Article.findByIdAndUpdate(id, { title, summary, content });
    return response.send({ message: 'Article updated.' });
  } catch (error) {
    console.log(error.message);
    return response.status(500).send({ message: error.message });
  };
};