import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../../plugins/aws';
import { Readable } from 'node:stream';
import sharp from 'sharp';

export class Image {

  static async getImg(req: any, res: any) {

    const dir = req.params.dir;
    const filename = req.params.img;
    const resolution = req.params.resolution;
    const filekey = `${dir}/${filename}`;


    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: filekey
    });

    try {

      const dataStream: any = await s3.send(command);

      if (resolution) {

        const resolutionArray = resolution.split('x'); // split '420x250' to ['420', '250']
        const width = Number(resolutionArray[0]);
        const height = Number(resolutionArray[1]);
        const transformer = sharp().resize(width, height);  // create a sharp transformer

        (dataStream.Body as Readable).pipe(transformer).pipe(res); // replace the original piping with the resize

      } else {

        (dataStream.Body as Readable).pipe(res);  // no resizing needed, just pipe the original image

      }

    } catch (error) {

      res.status(404).send({ error: 'Image not found' });

    }

  }

}