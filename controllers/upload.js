// server.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: 'dmyvk5qyq',
    api_key: '817443962198346',
    api_secret: 'YqUWDjBlyz2lZ7ckeDDWKiwOx54'
})

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // folder in your Cloudinary account
    format: async (req, file) => 'png', // or 'jpg', etc.
    public_id: (req, file) => file.originalname.split('.')[0],
  },
});

const upload = multer({ storage: storage });

const app = express();
app.use(express.json());

app.post('upload', upload.single('file'), (req, res) => {
    // console.log(req.body)
  const { name, description, file } = req.body;
  if (!req.file) {
    return res.status(400).json({ message: 'File upload failed' });
  }

  // Save file details and other inputs to MongoDB here (optional)
  // const fileUrl = req.file.path;
  // const publicId = req.file.filename;

  res.status(200).json({
    message: 'File uploaded successfully',
    fileUrl: req.file.path, // Cloudinary URL
    publicId: req.file.filename,
    name: name,
    description: description,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
