const response = require('../helpers/response');
const { Feed } = require('../models/Feed');
const { Comment } = require('../models/Comment');
const mongooseIdValidator = require('../helpers/mongooseIdValidator');
const { Reply } = require('../models/Reply');

// create a comment
exports.createComment = async (req, res) => {
  try {
    const { text, feedId } = req.body;
    const authUser = req.user.id;

    // check valid feed id
    await mongooseIdValidator(feedId, 'Feed', res);
    const feed = await Feed.findById(feedId);
    if (!feed) {
      return response.error(res, null, 'Feed not found!', 404);
    }

    // create comment
    const comment = await Comment.create({
      feed: feedId,
      user: authUser,
      text,
    });

    // add comment to feed
    await Feed.findByIdAndUpdate(
      feedId,
      { $push: { comments: comment._id } },
      { new: true },
    );

    // Populate the user field in the comment
    const newComment = await Comment.populate(comment, { path: 'user' });

    return response.success(
      res,
      newComment,
      'Comment created successfully!',
      201,
    );
  } catch (err) {
    return response.error(res, err, 'Error Occurred.', err.status || 500);
  }
};

// update a comment
exports.updateComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { id } = req.params;
    const authUser = req.user.id;

    // check valid comment id
    await mongooseIdValidator(id, 'Comment', res);
    const comment = await Comment.findById(id);

    // then check if the comment exists
    if (!comment) {
      return response.error(res, null, 'Comment not found!', 404);
    }

    // check if user is the owner of the comment first
    if (comment.user.toString() !== authUser) {
      return response.error(
        res,
        null,
        'You are not authorized! to update this comment',
        401,
      );
    }

    // update comment
    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { text },
      { new: true },
    );

    return response.success(
      res,
      updatedComment,
      'Comment updated successfully!',
      200,
    );
  } catch (err) {
    return response.error(res, err, 'Error Occurred.', err.status || 500);
  }
};

// delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const authUser = req.user.id;

    // check valid comment id
    await mongooseIdValidator(id, 'Comment', res);
    const comment = await Comment.findById(id);

    // check if the comment exists
    if (!comment) {
      return response.error(res, null, 'Comment not found!', 404);
    }

    // check if user is the owner of the comment
    if (comment.user.toString() !== authUser) {
      return response.error(
        res,
        null,
        'You are not authorized! to delete this comment',
        401,
      );
    }

    // delete comment
    await Comment.findByIdAndDelete(id);

    // remove comment from feed
    await Feed.findByIdAndUpdate(
      comment.feed,
      { $pull: { comments: id } },
      { new: true },
    );

    // delete replies
    await Reply.deleteMany({ comment: id });

    return response.success(res, null, 'Comment deleted successfully!', 200);
  } catch (err) {
    return response.error(res, err, 'Error Occurred.', err.status || 500);
  }
};

// like a comment
exports.likeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const authUser = req.user.id;

    // check valid comment id
    await mongooseIdValidator(id, 'Comment', res);
    const comment = await Comment.findById(id).populate('likes', 'user _id');

    // check if the comment exists
    if (!comment) {
      return response.error(res, null, 'Comment not found!', 404);
    }

    // check if user has already liked the comment
    const hasLiked = comment.likes.includes(authUser);
    const updateOperation = hasLiked
      ? { $pull: { likes: authUser } } // If already liked, remove the like
      : { $push: { likes: authUser } }; // If not liked, add the like
    // update comment
    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      updateOperation,
      { new: true },
    );

    return response.success(
      res,
      updatedComment,
      'Comment liked successfully!',
      200,
    );
  } catch (err) {
    return response.error(res, err, 'Error Occurred.', err.status || 500);
  }
};
