import { getDb } from '../../plugins/db';
import { FindOneAndUpdateOptions, ObjectId } from 'mongodb';
import { DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { s3 } from '../../plugins/aws';

export class References {

  static async all(req: any, res: any) {

    return res.json(await getDb().collection('references').find().toArray());

  }

  static async view(req: any, res: any) {

    if (!req.params.id) {
      console.log('No _id provided.')
      return res.send({ success: false, message: "No _id provided." });
    }

    const id = new ObjectId(String(req.params.id))

    return res.json(await getDb().collection('references').findOne({ _id: id }));

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

      await getDb().collection('references').insertOne(reference)

      return res.send({ success: true, message: "Referencia bola úspešne vytvorená.", reference: reference })

    } catch (error) {

      return res.send({ success: false, message: "Databáza neodpovedá, skúste to neskôr." })

    }

  }

  static async edit(req: any, res: any) {

    // Verify the ID
    if (!req.params.id || !ObjectId.isValid(String(req.params.id))) {
      return res.send({  success: false, message: "Invalid id." });
    }

    const id = new ObjectId(String(req.params.id))

    let existingGallery: any;
    const existingReference = await getDb().collection('references').findOne({ _id: id });
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

      await getDb().collection('references').updateOne({ _id: id }, { $set: reference });
      return res.send({ success: true, message: "Referencia bola úspešne aktualizovaná.", reference: reference });

    } catch(error) {

      return res.send({ success: false, message: "Databáza neodpovedá, skúste to neskôr." })

    }

  }

  static async remove(req: any, res: any) {

    if (!req.body.id || req.params.id !== req.body.id) {
      return res.send({ success: false, message: "Invalid request." });
    }

    const _id = String(req.body.id)

    // Verify the ID
    if (!_id || !ObjectId.isValid(_id)) {
      return res.send({  success: false, message: "Invalid id." });
    }

    const id = new ObjectId(_id)

    // Fetch the reference
    const referenceData = await getDb().collection('references').findOne({ _id: id });

    // If gallery is not empty, delete images from S3
    if (referenceData && referenceData.gallery.length > 0) {

      const deleteObjects = new DeleteObjectsCommand({
        Bucket: process.env.AWS_BUCKET,
        Delete: {
          Objects: referenceData.gallery.map((img: any) => ({ Key: img.path })),
        }
      })

      try {

        await s3.send(deleteObjects);

      } catch (error) {

        console.log('Error occurred while deleting the images from S3', error);
        return res.send({ success: false, message: "Image deletion from S3 failed" });

      }

    }

    // Now delete the reference from database
    try {

      await getDb().collection('references').deleteOne({ _id: id });
      return res.send({ success: true, message: "Reference removed" });

    } catch (error) {

      console.error(error);
      return res.send({ success: false, message: "Failed to remove reference from the database." });

    }

  }

  static async removeImage(req: any, res: any) {

    if (!req.body.id || !req.body.key || req.params.id !== req.body.id) {
      return res.send({ success: false, message: "Invalid request." });
    }

    const _id = String(req.body.id)
    const imgKey = Number(req.body.key)

    // Verify the ID
    if (!_id || !ObjectId.isValid(_id)) {
      return res.send({  success: false, message: "Invalid id." });
    }

    const id = new ObjectId(_id)

    // Fetch the reference
    const referenceData = await getDb().collection('references').findOne({ _id: id });

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

      console.log('Error occurred while deleting the image', error);
      return res.send({ success: false, message: "Image deletion failed" });

    }

    try {

      const filter = { _id: id };
      const update: any = { $pull: { gallery: { path: imageToDelete.path } } };
      const options = { returnDocument: 'after' } as FindOneAndUpdateOptions;

      const result = await getDb().collection('references').findOneAndUpdate(filter, update, options)


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

  static async setMainImage(req: any, res: any) {

    if (!req.body.id || !req.body.key || req.params.id !== req.body.id) {
      return res.send({ success: false, message: "Invalid request." });
    }

    const _id = String(req.body.id)
    const imgKey = Number(req.body.key)

    // Verify the ID
    if (!_id || !ObjectId.isValid(_id)) {
      return res.send({  success: false, message: "Invalid id." });
    }

    const id = new ObjectId(_id)

    // Fetch the reference
    const referenceData = await getDb().collection('references').findOne({ _id: id });

    // Validate imgKey
    if (imgKey < 0 || imgKey >= referenceData.gallery.length) {
      return res.send({ success: false, message: 'Image key out of range.' });
    }

    // Make all images main = false and selected image main = true
    for (let i = 0; i < referenceData.gallery.length; i++) {
      referenceData.gallery[i].main = i === imgKey;
    }

    try {

      // Update the gallery
      const result = await getDb().collection('references').updateOne({ _id: id }, { $set: { gallery: referenceData.gallery } });

      if (result && result.matchedCount > 0) {

        return res.send({ success: true, message: "Main image set.", gallery: referenceData.gallery });

      } else {

        return res.send({ success: false, message: "No document found or updated with the given _id." });

      }

    } catch (error) {

      console.error(error)
      return res.send({ success: false, message: "Databáza neodpovedá, skúste to neskôr." })

    }

  }

}