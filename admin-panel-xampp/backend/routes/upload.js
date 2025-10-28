const router = require('express').Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // keep file buffer in memory
const { uploadImage } = require('../controllers/uploadController');
const auth = require('../middleware/auth');

router.post('/', auth, upload.single('file'), uploadImage);

module.exports = router;
