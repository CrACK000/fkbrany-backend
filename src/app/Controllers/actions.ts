import { closeDb, connectToDb, getDb } from '../../db';
import Joi from 'joi';
import { validate } from '../../plugins/validate';
import nodemailer, { SendMailOptions } from 'nodemailer';
import { transport } from '../../plugins/mailer';

export class Actions {

  private readonly name: string;
  private readonly surname?: string;
  private readonly email: string;
  private readonly mobile: string;
  private readonly gate?: string;
  private readonly styleGate?: string;
  private readonly widthGate?: string;
  private readonly heightGate?: string;
  private readonly entryGate?: boolean;
  private readonly widthEntryGate?: string;
  private readonly heightEntryGate?: string;
  private readonly montage?: boolean;
  private readonly montagePlace?: string;
  private readonly motor?: boolean;
  private readonly msg: string;
  private readonly ip_address?: string;
  public pictures?: any;

  constructor(data: any = {}, _IP: string = undefined) {
    this.name = data.name;
    this.surname = data.surname || '';
    this.email = data.email;
    this.mobile = data.mobile;
    this.gate = data.gate || '';
    this.styleGate = data.styleGate || '';
    this.widthGate = data.widthGate || '';
    this.heightGate = data.heightGate || '';
    this.entryGate = data.entryGate || false;
    this.widthEntryGate = data.widthEntryGate || '';
    this.heightEntryGate = data.heightEntryGate || '';
    this.montage = data.montage || false;
    this.montagePlace = data.montagePlace || '';
    this.motor = data.motor || false;
    this.msg = data.msg;
    this.pictures = data.pictures || [];
    this.ip_address = _IP;
  }

  public validate(fields: string[]) {
    const schemaRules: any = {};

    fields.forEach(field => {
      if (validate[field]) {
        schemaRules[field] = validate[field];
      }
    })

    const schema = Joi.object(schemaRules).unknown(true);

    const obj = fields.reduce((acc, field) => {
      acc[field] = this[field];
      return acc;
    }, {});

    const { error } = schema.validate(obj, { abortEarly: false });

    if (error) {
      return error.details.map(detail => ({where: detail.path[0], message: detail.message}));
    }

    return null;
  }

  public mail(options: any) {

    let transporter = nodemailer.createTransport(transport as nodemailer.TransportOptions);

    try {
      let mail = transporter.sendMail(options)
      console.log(`E-mail bol úspešne odoslaný. ${mail}`);
      return true
    } catch (error) {
      console.log(`Chyba pri odosielaní e-mailu.`);
      return false
    }
  }

  public async postOfferGate(res: any) {

    // Validate data
    const validate = [
      'name',
      'surname',
      'email',
      'mobile',
      'gate',
      'styleGate',
      'widthGate',
      'heightGate',
      'widthEntryGate',
      'heightEntryGate',
      'montagePlace',
      'msg',
    ];
    const message = "Vaša požiadavka bola úspešne odoslaná.";                     // Success message
    const collection = "offers-gate";                                             // Collection name

    // Document data
    let document = {
      name: this.name,
      surname: this.surname,
      email: this.email,
      mobile: this.mobile,
      gate: this.gate,
      styleGate: this.styleGate,
      widthGate: this.widthGate,
      heightGate: this.heightGate,
      entryGate: this.entryGate,
      widthEntryGate: this.widthEntryGate,
      heightEntryGate: this.heightEntryGate,
      montage: this.montage,
      montagePlace: this.montagePlace,
      motor: this.motor,
      msg: this.msg,
      ip_address: this.ip_address,
      create_at: new Date()
    };

    // Mail options
    let mail = {
      from: 'noreply@fkbrany.sk',
      to: 'test@test.com',
      subject: 'E-mail s prílohami',
      text: 'Toto je e-mail s prílohami.'
    } as SendMailOptions;

    await this.create(validate, mail, collection, document, message, res)
  }

  public async postOfferRenovation(res: any) {

    const validate = ['name', 'email', 'mobile', 'widthGate', 'heightGate', 'msg'];       // Validate data
    const message = "Vaša požiadavka bola úspešne odoslaná.";                             // Success message
    const collection = "offers-renovation";                                               // Collection name

    // Document data
    let document = {
      name: this.name,
      email: this.email,
      mobile: this.mobile,
      widthGate: this.widthGate,
      heightGate: this.heightGate,
      msg: this.msg,
      ip_address: this.ip_address,
      create_at: new Date()
    };

    // Mail options
    let attachments = []
    if (this.pictures && this.pictures.length > 0){
      attachments = this.pictures.map((file: any) => ({
        filename: file.originalname,
        path: file.path
      }));
    }

    // Mail options
    let mail = {
      from: 'noreply@fkbrany.sk',
      to: 'test@test.com',
      subject: 'E-mail s prílohami',
      text: 'Toto je e-mail s prílohami.',
      attachments: attachments
    } as SendMailOptions;

    await this.create(validate, mail, collection, document, message, res)
  }

  public async postContactForm(res: any) {

    const validate = ['name', 'email', 'mobile', 'msg'];          // Validate data
    const message = "Vaša správa bola úspešne odoslaná.";         // Success message
    const collection = "messages";                                // Collection name

    // Document data
    let document = {
      name: this.name,
      email: this.email,
      mobile: this.mobile,
      msg: this.msg,
      ip_address: this.ip_address,
      create_at: new Date()
    };

    // Mail options
    let mail = {
      from: 'noreply@fkbrany.sk',
      to: 'test@test.com',
      subject: 'E-mail s prílohami',
      text: 'Toto je e-mail s prílohami.'
    } as SendMailOptions;

    await this.create(validate, mail, collection, document, message, res)
  }

  private async create(validate: any, mail: any, collection: string, document: any, message: string, res: any) {

    // Valid
    const errors = this.validate(validate);
    if (errors !== null) {
      return res.send({
        success: false,
        message: "Niekde nastala chyba. Skontrolujte či ste všetko vyplnili správne.",
        errors: errors
      });
    }

    // Post Mail
    if (!this.mail(mail))
      return res.send({
        success: false,
        message: "Niekde nastala chyba. Skúste to neskor.",
        errors: { where: "mail", message: "Zlyhalo odoslanie emailu." }
      });

    // Insert to mongoDB
    try {
      await connectToDb();
      const db = getDb();
      await db.collection(collection).insertOne(document);
      await closeDb();
      return res.send({ success: true, message: message });
    }
    catch(error){
      return res.send({ success: false, message: "Niekde nastala chyba. Skúste to neskor.", errors: { where: "db", message: error } });
    }

  }

}