const path = require('path');
const multer = require('multer');

const mediaFolder = './uploads/media/';
const otherFolder = './uploads/others/';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'gallery') {
      cb(null, mediaFolder);
    } else {
      cb(null, otherFolder);
    }
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${file.originalname
      .replace(fileExtension, '')
      .toLowerCase()
      .split(' ')
      .join('-')}-${Date.now().toString()}${fileExtension}`;

    cb(null, fileName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 200000000, // 200MB
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image' || file.fieldname === 'gallery') {
      if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'application/mp4' ||
        file.mimetype === 'application/avi' ||
        file.mimetype === 'application/mkv' ||
        file.mimetype === 'application/3gp' ||
        file.mimetype === 'application/mov' ||
        file.mimetype === 'application/flv' ||
        file.mimetype === 'application/wmv' ||
        file.mimetype === 'application/webm' ||
        file.mimetype === 'application/mpeg'
      ) {
        cb(null, true);
      } else {
        cb(
          new Error(
            'Only .jpg, .jpeg, and .png & .mp4, .avi, .mkv, .3gp, .mov, .flv, .wmv, .webm and .mpeg format are allowed.',
          ),
        );
      }
    } else {
      cb(new Error('There was an unknown error!'));
    }
  },
});

module.exports = upload;
