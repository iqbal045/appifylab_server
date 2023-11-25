const router = require('express').Router();
const upload = require('../utils/multer');

// import controller methods
const {
  getAllFeeds,
  createFeed,
  updateFeed,
  deleteFeed,
  likeFeed,
} = require('../controllers/FeedController');

// import validation
const { validate } = require('../validation');
const { feedSchema } = require('../validation/feedValidations');

// routes
router.get('/', getAllFeeds); // index

router.post('/', validate(feedSchema), upload.array('gallery', 12), createFeed); // store

router.put(
  '/:id',
  validate(feedSchema),
  upload.array('gallery', 12),
  updateFeed,
); // update

router.delete('/:id', deleteFeed); // destroy

router.get('/:id/like', likeFeed); // like

module.exports = router;
