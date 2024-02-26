import { validate } from '../../plugins/validate';
import Joi from 'joi';
import { getDb } from '../../plugins/db';
import { FindOneAndUpdateOptions, ObjectId } from 'mongodb';

export class Settings {

  static async get(req: any, res: any) {

    const id = new ObjectId(process.env.WEB_SETTINGS_ID)

    return res.send(await getDb().collection('settings').findOne({ _id: id }));

  }

  static async webSettings(req: any, res: any) {

    const id = new ObjectId(process.env.WEB_SETTINGS_ID)

    const schema = Joi.object({
      receiving_email: validate.email,
      // pridajte ďalšie pravidlá pre všetky parametre,
      // ktoré chcete validovať,
      // napríklad:
      // some_parameter: validate.some_rule
    });

    const parametersToBeValidated = {
      receiving_email: req.body.receiving_email,
      // pridajte ďalšie parametre:
      // some_parameter: req.body.some_parameter
    }

    const { error } = schema.validate(parametersToBeValidated);

    if (error) {
      console.error(error);
      return res.send({ success: false, message: error.details[0].message });
    }

    const document = req.body

    try {

      const options = { returnDocument: 'after' } as FindOneAndUpdateOptions;
      const result = await getDb().collection('settings').findOneAndUpdate({ _id: id }, { $set: document }, options)
      return res.send({ success: true, message: "Nastavenia boli aktualizované.", document: result });

    } catch (error) {

      console.error(error);
      return res.send({ success: false, message: "Databáza neodpovedá, skúste to neskôr." });

    }

  }

  static async changePassword(req: any, res: any) {

    // in process

  }

}