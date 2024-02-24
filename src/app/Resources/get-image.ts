import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../../plugins/aws';
import { Readable } from 'node:stream';

export class Image {

  static async getImg(req: any, res: any) {
    const dir = req.params.dir;
    const filename = req.params.img;
    const filekey = `${dir}/${filename}`;

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: filekey
    });

    try {
      const dataStream: any = await s3.send(command);
      (dataStream.Body as Readable).pipe(res);
    } catch (error) {
      res.status(404).send({ error: 'Image not found' });
    }
  }

}