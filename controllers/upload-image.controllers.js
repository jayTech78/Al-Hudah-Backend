const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");
const multer = require('multer');

cloudinary.config({
  cloud_name: "dmyvk5qyq",
  api_key: "817443962198346",
  api_secret: "YqUWDjBlyz2lZ7ckeDDWKiwOx54",
});

const upload_Image = (req, res) => {
  // console.log('got here')
  // console.log('req:'+req.file);
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'student dps' },
    (error, result) => {
      if (error) {
        return res.status(500).json({ error: 'Upload to Cloudinary failed' });
      }
      // console.log(result.secure_url)
      res.status(200).json({ fileUrl: result.secure_url });
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
};

module.exports = { upload_Image };
