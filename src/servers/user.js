import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json()); //parse JSON

const uploads = 'src/uploadFiles'; 
if (!fs.existsSync(uploads)) {
  fs.mkdirSync(uploads, { recursive: true });
}

// storing using multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploads);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${Date.now()}-${file.originalname}`; 
    cb(null, uniqueFilename);
  }
});

const upload = multer({ storage });
app.post('/upload', upload.single('file'), (req, res) => {
  const { authorName, bookName } = req.body;

  // Path to JSON folder
  const userInfoPath = path.join('src/userInfo.json'); // set a different path when API is exposed

  // check the old array and if new set empty array
  let userData = [];
  if (fs.existsSync(userInfoPath)) {
    const data = fs.readFileSync(userInfoPath);
    userData = JSON.parse(data);
  }
  // Append new data
  userData.push({
    authorName,
    bookName,
    file: {
      name: req.file.originalname,
      path: path.join('src/uploadFiles', req.file.filename),
    },
  });

  // save the data in JSON folder
  fs.writeFileSync(userInfoPath, JSON.stringify(userData, null, 2));

  res.json({
    message: 'File uploaded successfully.',
    file: {
      name: req.file.originalname,
      path: path.join('src/uploadFiles', req.file.filename),
    },
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
