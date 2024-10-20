import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json()); //parsing JSON 

const uploads = 'C:/Users/puspa/Desktop/upload/upload-app/uploadFiles'; //change the path when API is exposed 
if (!fs.existsSync(uploads)) {
  fs.mkdirSync(uploads, { recursive: true });
}

//storing using multer
const storage = multer.diskStorage({
  destination: function (req, file, cb){
    cb(null, uploads);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${Date.now()}-${file.originalname}`; 
    cb(null, uniqueFilename);
  }
});

const upload = multer({ storage });

app.post('/upload', upload.array('files'), (req, res) => {
  const { authorName, bookName } = req.body;

  // Path of JSON folder
  const userInfoPath = path.join('C:/Users/puspa/Desktop/upload/upload-app/userInfo.json');

  //check the old array and if new set empty array
  let userData = [];
  if (fs.existsSync(userInfoPath)) {
    const data = fs.readFileSync(userInfoPath);
    userData = JSON.parse(data);
  }

  // Append data for new uploads
  req.files.forEach(file => {
    userData.push({
      authorName,
      bookName,
      file: {
        name: file.originalname,
        path: path.join('/uploadFiles', file.filename),
      },
    });
  });

  // Save the data in JSON folder
  fs.writeFileSync(userInfoPath, JSON.stringify(userData, null, 2));

  res.json({
    message: 'Files uploaded successfully.',
    files: req.files.map(file =>({
      name: file.originalname,
      path: path.join('/uploadFiles', file.filename),
    })),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
