const config = require('config');
const fs = require('fs').promises;
const path = require('path');
const response = require('../helpers/response');
const { Feed } = require('../models/Feed');
// eslint-disable-next-line no-unused-vars
const { Comment } = require('../models/Comment');
const { Reply } = require('../models/Reply');
const { User } = require('../models/User'); // used in populate

// Get all feeds
exports.getAllFeeds = async (req, res) => {
  try {
    const feeds = await Feed.find()
      .populate('user', 'name _id')
      .populate('likes', 'name _id')
      .populate({
        path: 'comments',
        populate: [
          {
            path: 'user',
            select: 'name _id',
          },
          {
            path: 'likes',
            select: 'name _id',
          },
          {
            path: 'replies',
            populate: {
              path: 'user',
              select: 'name _id',
            },
          },
        ],
      });
    return response.success(res, feeds, 'Feeds fetched successfully!', 200);
  } catch (err) {
    return response.error(res, err, 'Error Occurred.', err.status || 500);
  }
};

// create a feed
exports.createFeed = async (req, res) => {
  try {
    const { text } = req.body;
    const gallery = req.files;
    const authUser = req.user.id;

    const galleryPaths = [];
    if (gallery) {
      await gallery.forEach(image => {
        galleryPaths.push(
          `${config.get('APP_URL')}/${image.path.replace(/\\/g, '/')}`,
        );
      });
    }

    const feed = await Feed.create({
      user: authUser,
      text,
      gallery: galleryPaths,
    });

    // Populate the user field in the feed
    const newFeed = await Feed.populate(feed, { path: 'user' });

    return response.success(res, newFeed, 'Feed created successfully!', 201);
  } catch (err) {
    return response.error(res, err, 'Error Occurred.', err.status || 500);
  }
};

// update a feed
exports.updateFeed = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const gallery = req.files;
    const authUser = req.user.id;

    const feed = await Feed.findById(id);

    // check if the feed exists
    if (!feed) {
      return response.error(res, null, 'Feed not found!', 404);
    }

    // check if the user is the owner of the feed
    if (feed.user.toString() !== authUser) {
      return response.error(res, null, 'You are not authorized!', 401);
    }

    // find old image paths & delete them
    const oldGallery = feed.gallery;
    if (oldGallery.length > 0) {
      await oldGallery.map(async image => {
        const imagePath = image.split('/').pop();
        await fs.unlink(path.join('./uploads/media', imagePath));
      });
    }

    // update gallery
    const galleryPaths = gallery
      ? gallery.map(
          image => `${config.get('APP_URL')}/${image.path.replace(/\\/g, '/')}`,
        )
      : [];

    // update feed
    await Feed.findByIdAndUpdate(id, {
      text,
      gallery: galleryPaths,
    });

    return response.success(res, feed, 'Feed updated successfully!', 200);
  } catch (err) {
    return response.error(res, err, 'Error Occurred.', err.status || 500);
  }
};

// delete a feed
exports.deleteFeed = async (req, res) => {
  try {
    const { id } = req.params;
    const authUser = req.user.id;

    const feed = await Feed.findById(id);

    if (!feed) {
      return response.error(res, null, 'Feed not found!', 404);
    }

    // check if the user is the owner of the feed
    if (feed.user.toString() !== authUser) {
      return response.error(res, null, 'You are not authorized!', 401);
    }

    // find old image paths & delete them
    const oldGallery = feed.gallery;
    if (oldGallery.length > 0) {
      await oldGallery.map(async image => {
        const imagePath = image.split('/').pop();
        await fs.unlink(path.join('./uploads/media', imagePath));
      });
    }

    // delete feed
    await Feed.findByIdAndDelete(id);

    // delete comments
    const comments = await Comment.find({ feed: id });
    const commentIds = comments.map(comment => comment._id);
    await Comment.deleteMany({ feed: id });

    // delete replies
    await Reply.deleteMany({ comment: { $in: commentIds } });

    return response.success(res, null, 'Feed deleted successfully!', 200);
  } catch (err) {
    return response.error(res, err, 'Error Occurred.', err.status || 500);
  }
};

// like a feed
exports.likeFeed = async (req, res) => {
  try {
    const { id } = req.params;
    const authUser = req.user.id;

    const feed = await Feed.findById(id);

    if (!feed) {
      return response.error(res, null, 'Feed not found!', 404);
    }

    // Check if the user has already liked the feed
    const hasLiked = feed.likes.includes(authUser);
    const updateOperation = hasLiked
      ? { $pull: { likes: authUser } } // If already liked, remove the like
      : { $addToSet: { likes: authUser } }; // If not liked, add the like
    // update feed
    const updatedFeed = await Feed.findByIdAndUpdate(id, updateOperation);

    return response.success(
      res,
      updatedFeed,
      'Feed like-unlike toggled successfully!',
      200,
    );
  } catch (err) {
    return response.error(res, err, 'Error Occurred.', err.status || 500);
  }
};
