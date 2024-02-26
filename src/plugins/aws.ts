import { S3Client } from "@aws-sdk/client-s3";
import multer from 'multer';
import multerS3 from 'multer-s3';
import { generateRandomString } from './random-string';


export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

export const upload = multer({

  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET,
    key: function (req, file, cb) {

      const uniqueFileName = generateRandomString(10);
      const extension = file.mimetype.split('/')[1];
      cb(null, `references/${Date.now().toString()}-${uniqueFileName}.${extension}`);

    }
  })

});