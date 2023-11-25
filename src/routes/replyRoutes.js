const router = require('express').Router();

// import controller methods
const {
  createReply,
  updateReply,
  deleteReply,
  likeReply,
} = require('../controllers/ReplyController');

// import validation
const { validate } = require('../validation');
const {
  createReplySchema,
  updateReplySchema,
} = require('../validation/replyValidation');

// routes
router.post('/', validate(createReplySchema), createReply); // store

router.put('/:id', validate(updateReplySchema), updateReply); // update

router.delete('/:id', deleteReply); // destroy

router.get('/:id/like', likeReply); // like

module.exports = router;
