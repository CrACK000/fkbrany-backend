import { connectToDb, getDb } from '../../db';
import { FindOneAndUpdateOptions, ObjectId } from 'mongodb';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../../plugins/aws';

export class References {

  static async all(req: any, res: any) {
    await connectToDb();
    const db = getDb();
    res.json(await db.collection('references').find().toArray());
  }

  static async view(req: any, res: any) {
    if (!req.params.id) {
      throw new Error('No _id provided');
    }

    await connectToDb();
    const db = getDb();
    const id = new ObjectId(String(req.params.id))
    res.json(await db.collection('references').findOne({ _id: id }));
  }

  static async create(req: any, res: any) {
    let gallery = req.files.map((file: { key: string }) => ({
      path: file.key,
      main: false
    }));

    let reference = {
      title: req.body.title as string,
      description: req.body.description as string,
      created_at: new Date(),
      gallery: gallery
    };

    try {
      await connectToDb();
      const db = getDb();
      await db.collection('references').insertOne(reference)
      return res.send({ success: true, message: "Referencia bola úspešne vytvorená.", reference: reference })
    } catch (error) {
      return res.send({ success: false, message: "Databáza neodpovedá, skúste to neskôr." })
    }
  }

  static async edit(req: any, res: any) {
    await connectToDb();
    const db = getDb();

    // Verify the ID
    if (!req.params.id || !ObjectId.isValid(String(req.params.id))) {
      return res.send({  success: false, message: "Invalid id." });
    }

    const id = new ObjectId(String(req.params.id))

    let existingGallery: any;
    const existingReference = await db.collection('references').findOne({ _id: id });
    existingGallery = existingReference?.gallery || [];

    let uploadedGallery = req.files.map((file: { key: string }) => ({
      path: file.key,
      main: false
    }));

    let gallery = [...existingGallery, ...uploadedGallery];

    let reference = {
      title: req.body.title as string,
      description: req.body.description as string,
      gallery: gallery
    };

    try {
      await db.collection('references').updateOne({ _id: id }, { $set: reference });
      return res.send({ success: true, message: "Referencia bola úspešne aktualizovaná.", reference: reference })
    } catch(error) {
      return res.send({ success: false, message: "Databáza neodpovedá, skúste to neskôr." })
    }
  }

  static async remove(req: any, res: any) {

  }

  static async removeImage(req: any, res: any) {

    if (!req.body.id || !req.body.key || req.params.id !== req.body.id) {
      return res.send({ success: false, message: "Invalid request." });
    }

    await connectToDb();
    const db = getDb();

    const _id = String(req.body.id)
    const imgKey = Number(req.body.key)

    // Verify the ID
    if (!_id || !ObjectId.isValid(_id)) {
      return res.send({  success: false, message: "Invalid id." });
    }

    const id = new ObjectId(_id)

    // Fetch the reference
    const referenceData = await db.collection('references').findOne({ _id: id });

    // Validate imgKey
    if (imgKey < 0 || imgKey >= referenceData.gallery.length) {
      return res.send({ success: false, message: 'Image key out of range.' });
    }

    const imageToDelete = referenceData.gallery[imgKey];

    // Delete from S3 first
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: imageToDelete.path
    });

    try {
      await s3.send(deleteCommand);
    } catch (error) {
      res.send({ success: false, message: "Image deletion failed" });
      console.log('Error occurred while deleting the image', error);
      return;
    }

    try {
      const filter = { _id: id };
      const update: any = { $pull: { gallery: { path: imageToDelete.path } } };
      const options = { returnDocument: 'after' } as FindOneAndUpdateOptions;

      const result = await db.collection('references').findOneAndUpdate(filter, update, options)

      if (result) {
        return res.send({ success: true, message: "Image removed.", gallery: result.gallery });
      } else {
        return res.send({ success: false, message: "No document found or updated with the given _id." });
      }
    } catch (error) {
      console.error(error)
      return res.send({ success: false, message: "Databáza neodpovedá, skúste to neskôr." })
    }

  }

}