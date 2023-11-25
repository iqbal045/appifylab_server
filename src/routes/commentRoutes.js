const router = require('express').Router();

// import controller methods
const {
  createComment,
  updateComment,
  deleteComment,
  likeComment,
} = require('../controllers/CommentController');

// import validation
const { validate } = require('../validation');
const {
  createCommentSchema,
  updateCommentSchema,
} = require('../validation/commentValidation');

// routes
router.post('/', validate(createCommentSchema), createComment); // store

router.put('/:id', validate(updateCommentSchema), updateComment); // update

router.delete('/:id', deleteComment); // delete

router.get('/:id/like', likeComment); // like

module.exports = router;
