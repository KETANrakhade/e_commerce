const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file' });

    const streamifier = require('streamifier');
    const stream = cloudinary.uploader.upload_stream({ folder: 'ecommerce' }, (error, result) => {
      if (error) return res.status(500).json({ msg: 'Upload error', error });
      res.json({ url: result.secure_url });
    });
    streamifier.createReadStream(req.file.buffer).pipe(stream);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { uploadImage };
