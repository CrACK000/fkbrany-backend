import express from 'express';
import { Forms } from './app/class/forms';
import { References } from './app/class/references';
import multer from 'multer';
import { Authentication } from './app/class/auth';
import { upload } from './plugins/aws'
import { Image } from './app/resources/get-image';
import { Settings } from './app/class/settings';

const router = express.Router();

const uploadForMail = multer({dest: 'uploads/'});


/**     ACTIONS     **/
router.post('/create-offer-gate', Forms.sendOfferGate);
router.post('/send-contact', Forms.sendContact);
router.post('/create-offer-renovation', uploadForMail.array('pictures', 3), Forms.sendOfferRenovationGate);

/**     AUTHENTICATION     **/
router.post('/login', Authentication.login)
router.get('/check-auth', Authentication.checkAuth)
router.get('/logout', Authentication.logout)


/**     REFERENCES     **/
router.get( '/references', References.all);
router.get( '/reference/view/:id', References.view);
router.post('/references/create', upload.array('files', 8), References.create);
router.post('/references/counter', References.counter);
router.post('/references/edit/:id', upload.array('files', 8), References.edit);
router.post('/references/edit/:id/image', References.setMainImage);
router.post('/references/remove/:id', References.remove);
router.post('/references/remove/:id/image', References.removeImage);

/**     SETTINGS     **/
router.get( '/settings', Settings.get)
router.post('/settings/web', Settings.webSettings)
router.post('/settings/password', Settings.changePassword)

/**     SELECT IMAGES FROM S3     **/
router.get('/image/:dir/:img/:resolution?', Image.getImg);

export default router