const response = require('../helpers/response');
const mongooseIdValidator = require('../helpers/mongooseIdValidator');
const { Reply } = require('../models/Reply');
const { Comment } = require('../models/Comment');

// create a reply
exports.createReply = async (req, res) => {
  try {
    const { text, commentId } = req.body;
    const authUser = req.user.id;

    // check valid comment id
    await mongooseIdValidator(commentId, 'Comment', res);
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return response.error(res, null, 'Comment not found!', 404);
    }

    // create reply
    const reply = await Reply.create({
      comment: commentId,
      user: authUser,
      text,
    });

    // add reply to comment
    await Comment.findByIdAndUpdate(
      commentId,
      { $push: { replies: reply._id } },
      { new: true },
    );

    // Populate the user field in the reply
    const newReply = await Reply.populate(reply, { path: 'user' });

    return response.success(res, newReply, 'Reply created successfully!', 201);
  } catch (err) {
    return response.error(res, err, 'Error Occurred.', err.status || 500);
  }
};

// update a reply
exports.updateReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const authUser = req.user.id;

    const reply = await Reply.findById(id);

    // check if the reply exists
    if (!reply) {
      return response.error(res, null, 'Reply not found!', 404);
    }

    // check if the reply belongs to the user
    if (reply.user.toString() !== authUser) {
      return response.error(res, null, 'Not authorized!', 401);
    }

    // update reply
    const updatedReply = await Reply.findByIdAndUpdate(
      id,
      { text },
      { new: true },
    );

    return response.success(
      res,
      updatedReply,
      'Reply updated successfully!',
      200,
    );
  } catch (err) {
    return response.error(res, err, 'Error Occurred.', err.status || 500);
  }
};

// delete a reply
exports.deleteReply = async (req, res) => {
  try {
    const { id } = req.params;
    const authUser = req.user.id;

    const reply = await Reply.findById(id);

    // check if the reply exists
    if (!reply) {
      return response.error(res, null, 'Reply not found!', 404);
    }

    // check if the reply belongs to the user
    if (reply.user.toString() !== authUser) {
      return response.error(res, null, 'Not authorized!', 401);
    }

    // delete reply
    await Reply.findByIdAndDelete(id);

    // remove reply from comment
    await Comment.findByIdAndUpdate(
      reply.comment,
      { $pull: { replies: id } },
      { new: true },
    );

    return response.success(res, null, 'Reply deleted successfully!', 200);
  } catch (err) {
    return response.error(res, err, 'Error Occurred.', err.status || 500);
  }
};

// like a reply
exports.likeReply = async (req, res) => {
  try {
    const { id } = req.params;
    const authUser = req.user.id;

    const reply = await Reply.findById(id);

    // check if the reply exists
    if (!reply) {
      return response.error(res, null, 'Reply not found!', 404);
    }

    // heck if the user has already liked the reply
    const hasLiked = reply.likes.includes(authUser);
    const updateOperation = hasLiked
      ? { $pull: { likes: authUser } } // If already liked, remove the like
      : { $push: { likes: authUser } }; // If not liked, add the like

    // update reply
    const updatedReply = await Reply.findByIdAndUpdate(id, updateOperation);

    return response.success(
      res,
      updatedReply,
      'Reply like-unlike toggle successfully!',
      200,
    );
  } catch (err) {
    return response.error(res, err, 'Error Occurred.', err.status || 500);
  }
};
