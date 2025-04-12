const express = require('express');
const router = express.Router();
const controller = require('../controllers/MenuItemController');
const multer = require('multer');
const path = require('path');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, ''))
});
const upload = multer({ storage });

// Routes
router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', upload.array('image', 5), controller.create);
router.put('/:id', upload.array('image', 5), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
