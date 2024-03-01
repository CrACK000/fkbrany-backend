import settings from '../../plugins/settings';
import { validate } from '../../plugins/validate';
import Joi from 'joi';
import type { SendMailOptions } from 'nodemailer';
import { mailer } from '../../plugins/mailer';
import { getDb } from '../../plugins/db';

export class Forms {

  static async sendOfferGate(req: any, res: any) {

    const { error } = Joi.object(validate).options({ allowUnknown: false }).validate(req.body);

    if (error) {
      const errors = error.details.map(item => {
        return { where: item.path[0], message: item.message };
      });
      console.log(errors)
      return res.send({
        success: false,
        message: "Niekde nastala chyba. Skontrolujte či ste všetko vyplnili správne.",
        errors: errors
      });
    }

    const appData = await settings()
    const { name, surname, email, mobile, gate, styleGate, widthGate, heightGate, entryGate, widthEntryGate, heightEntryGate, montage, montagePlace, fenceParts, fencePartsList, motor, msg } = req.body

    // Document data
    let document = {
      name: name,
      surname: surname,
      email: email,
      mobile: mobile,
      gate: gate,
      styleGate: styleGate,
      widthGate: widthGate,
      heightGate: heightGate,
      entryGate: entryGate,
      widthEntryGate: widthEntryGate,
      heightEntryGate: heightEntryGate,
      montage: montage,
      montagePlace: montagePlace,
      fenceParts: fenceParts,
      fencePartsList: fencePartsList,
      motor: motor,
      msg: msg,
      ip_address: req.ip,
      create_at: new Date()
    }

    // fence parts list for email text
    let fencePartsString = '';
    if (Array.isArray(document.fencePartsList)) {
      fencePartsString = document.fencePartsList.map(part =>
        `Počet: ${part.count}, Šírka: ${part.width}, Výška: ${part.height}`
      ).join('\n');
    }

    // fence parts list for email html
    let fencePartsHtml = '';
    if (Array.isArray(document.fencePartsList)) {
      fencePartsHtml = document.fencePartsList.map(part =>
        `<p>Počet: ${part.count}, Šírka: ${part.width}, Výška: ${part.height}</p>`
      ).join('\n');
    }

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
    
    ${document.fenceParts ? `
    Plotové dielce
    ${fencePartsString}
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
    
    ${document.fenceParts ? `
      <h4 style="padding-top: 6px;">Plotové dielce</h4>
      ${fencePartsHtml}
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

    if (!await mailer().sendMail(mail)) {
      return res.send({
        success: false,
        message: 'Niekde nastala chyba. Skúste to neskor.',
        errors: { where: 'mail', message: 'Zlyhalo odoslanie emailu.' }
      });
    }

    try {

      await getDb().collection('offers-gate').insertOne(document);
      return res.send({ success: true, message: "Vaša požiadavka bola úspešne odoslaná." });

    } catch(error) {

      return res.send({ success: false, message: "Niekde nastala chyba. Skúste to neskor.", errors: { where: "db", message: error } });

    }

  }

  static async sendOfferRenovationGate(req: any, res: any) {

    const { error } = Joi.object(validate).options({ allowUnknown: false }).validate(req.body);

    if (error) {
      const errors = error.details.map(item => {
        return { where: item.path[0], message: item.message };
      });
      console.log(errors)
      return res.send({
        success: false,
        message: "Niekde nastala chyba. Skontrolujte či ste všetko vyplnili správne.",
        errors: errors
      });
    }

    const appData = await settings()
    const { name, email, mobile, widthGate, heightGate, msg } = req.body

    // Mail options
    let attachments = []
    if (req.files && req.files.length > 0){
      attachments = req.files.map((file: any) => ({
        filename: file.originalname,
        path: file.path
      }));
    }

    // Document data
    let document = {
      name: name,
      email: email,
      mobile: mobile,
      widthGate: widthGate,
      heightGate: heightGate,
      msg: msg,
      ip_address: req.ip,
      create_at: new Date()
    };

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

    if (!await mailer().sendMail(mail)) {
      return res.send({
        success: false,
        message: 'Niekde nastala chyba. Skúste to neskor.',
        errors: { where: 'mail', message: 'Zlyhalo odoslanie emailu.' }
      });
    }

    try {

      await getDb().collection('offers-renovation').insertOne(document);
      return res.send({ success: true, message: "Vaša požiadavka bola úspešne odoslaná." });

    } catch(error) {

      return res.send({ success: false, message: "Niekde nastala chyba. Skúste to neskor.", errors: { where: "db", message: error } });

    }

  }

  static async sendContact(req: any, res: any) {

    const { error } = Joi.object(validate).options({ allowUnknown: false }).validate(req.body);

    if (error) {
      const errors = error.details.map(item => {
        return { where: item.path[0], message: item.message };
      });
      console.log(errors)
      return res.send({
        success: false,
        message: "Niekde nastala chyba. Skontrolujte či ste všetko vyplnili správne.",
        errors: errors
      });
    }

    const appData = await settings()
    const { name, email, mobile, msg } = req.body

    // Document data
    let document = {
      name: name,
      email: email,
      mobile: mobile,
      msg: msg,
      ip_address: req.ip,
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

    if (!await mailer().sendMail(mail)) {
      return res.send({
        success: false,
        message: 'Niekde nastala chyba. Skúste to neskor.',
        errors: { where: 'mail', message: 'Zlyhalo odoslanie emailu.' }
      });
    }

    try {

      await getDb().collection('messages').insertOne(document);
      return res.send({ success: true, message: "Vaša správa bola úspešne odoslaná." });

    } catch(error) {

      return res.send({ success: false, message: "Niekde nastala chyba. Skúste to neskor.", errors: { where: "db", message: error } });

    }

  }

}