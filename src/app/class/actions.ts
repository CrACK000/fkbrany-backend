import { getDb } from '../../plugins/db';
import Joi from 'joi';
import { validate } from '../../plugins/validate';
import type { SendMailOptions } from 'nodemailer';
import { mailer } from '../../plugins/mailer';
import settings from '../../plugins/settings';

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

    try {

      let mail = mailer().sendMail(options)
      console.log(`E-mail bol úspešne odoslaný. ${mail}`);
      return true

    } catch (error) {

      console.log(`Chyba pri odosielaní e-mailu.`);
      return false

    }

  }

  public async postOfferGate(res: any) {

    const appData = await settings()

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

    let emailText = `
    Žiadosť o nacenenie brány
    Meno a priezvisko: ${document.name} ${document.surname}
    Email: ${document.email}
    Telefónne číslo: ${document.mobile}
    
    Brána
    Typ brány: ${document.gate}
    Štýl: ${document.styleGate}
    Šírka otvoru: ${document.widthGate}
    Výška otvoru: ${document.heightGate}
    
    ${document.entryGate ? `
    Vstupná bránka
    Šírka otvoru: ${document.widthEntryGate}
    Výška otvoru: ${document.heightEntryGate}
    ` : ``}
    
    ${document.montage ? `
    Montáž
    Lokalita: ${document.montagePlace}
    ` : ``}
    
    Motor
    ${document.motor ? 'Ano' : 'Nie'}
    
    Správa: ${document.msg}`;

    let emailHtml = `
    <h3>Žiadosť o nacenenie brány</h3>
    <p>Meno: ${document.name} ${document.surname}</p>
    <p>Email: ${document.email}</p>
    <p>Telefónne číslo: ${document.mobile}</p>
    
    <h4 style="padding-top: 6px;">Brána</h4>
    <p>Typ brány: ${document.gate}</p>
    <p>Štýl: ${document.styleGate}</p>
    <p>Šírka otvoru: ${document.widthGate}</p>
    <p>Výška otvoru: ${document.heightGate}</p>
    
    ${document.entryGate ? `
      <h4 style="padding-top: 6px;">Vstupná bránka</h4>
      <p>Šírka otvoru: ${document.widthEntryGate}</p>
      <p>Výška otvoru: ${document.heightEntryGate}</p>
    ` : ``}
    
    ${document.montage ? `
      <h4 style="padding-top: 6px;">Montáž</h4>
      <p>Lokalita: ${document.montagePlace}</p>
    ` : ``}
    
    <h4 style="padding-top: 6px;">Motor</h4>
    <p>${document.motor ? 'Ano' : 'Nie'}</p>
    
    <h5 style="padding-top: 6px;">Správa</h5>
    <p>${document.msg}</p>`;

    // Mail options
    let mail = {
      from: 'noreply@fkbrany.sk',
      to: appData.receiving_email,
      replyTo: document.email,
      subject: 'Žiadosť o nacenenie brány',
      text: emailText,
      html: emailHtml,
    } as SendMailOptions;

    await this.create(validate, mail, collection, document, message, res)

  }

  public async postOfferRenovation(res: any) {

    const appData = await settings()

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

    let emailText = `
    Žiadosť o renováciu
    Meno: ${document.name}
    Email: ${document.email}
    Telefónne číslo: ${document.mobile}
    Šírka brány: ${document.widthGate}
    Výška brány: ${document.heightGate}
    Správa: ${document.msg}`;

    let emailHtml = `
    <h3>Žiadosť o renováciu</h3>
    <p>Meno: ${document.name}</p>
    <p>Email: ${document.email}</p>
    <p>Telefónne číslo: ${document.mobile}</p>
    <p>Šírka brány: ${document.widthGate}</p>
    <p>Výška brány: ${document.heightGate}</p>
    <p>Správa: ${document.msg}</p>`;

    // Mail options
    let mail = {
      from: 'noreply@fkbrany.sk',
      to: appData.receiving_email,
      replyTo: document.email,
      subject: 'Žiadosť o renováciu',
      text: emailText,
      html: emailHtml,
      attachments: attachments
    } as SendMailOptions;

    await this.create(validate, mail, collection, document, message, res)

  }

  public async postContactForm(res: any) {

    const appData = await settings()

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

    let emailText = `
    Kontaktný formulár
    Meno: ${document.name}
    Email: ${document.email}
    Telefónne číslo: ${document.mobile}
    Správa: ${document.msg}`;

    let emailHtml = `
    <h3>Kontaktný formulár</h3>
    <p>Meno: ${document.name}</p>
    <p>Email: ${document.email}</p>
    <p>Telefónne číslo: ${document.mobile}</p>
    <p>Správa: ${document.msg}</p>`;

    // Mail options
    let mail = {
      from: 'noreply@fkbrany.sk',
      to: appData.receiving_email,
      replyTo: document.email,
      subject: 'Kontaktný formulár',
      text: emailText,
      html: emailHtml
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
    if (!this.mail(mail)) {
      return res.send({
        success: false,
        message: 'Niekde nastala chyba. Skúste to neskor.',
        errors: { where: 'mail', message: 'Zlyhalo odoslanie emailu.' }
      });
    }


    try {

      await getDb().collection(collection).insertOne(document);
      return res.send({ success: true, message: message });

    } catch(error) {

      return res.send({ success: false, message: "Niekde nastala chyba. Skúste to neskor.", errors: { where: "db", message: error } });

    }

  }

}