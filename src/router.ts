import express from 'express';
import { Actions } from './app/Controllers/actions';
import { References } from './app/Controllers/references';
import multer from 'multer';
import { Authentication } from './app/Controllers/auth';
import { upload } from './plugins/aws'
import { Image } from './app/Resources/get-image';

const router = express.Router();

const uploadForMail = multer({dest: 'uploads/'});



router.post('/create-offer-gate', async (req, res) => {
  const actions = new Actions(req.body, req.ip);
  await actions.postOfferGate(res);
});

router.post('/send-contact', async (req, res) => {
  const actions = new Actions(req.body, req.ip);
  await actions.postContactForm(res);
});

router.post('/create-offer-renovation', uploadForMail.array('pictures', 3), async (req, res) => {
  const data = JSON.parse(req.body.data)
  const actions = new Actions(data, req.ip);
  if (req.files && req.files.length) {
    actions.pictures = req.files;
  }
  await actions.postOfferRenovation(res);
});


router.post('/login', Authentication.login)
router.get('/check-auth', Authentication.checkAuth)
router.get('/logout', Authentication.logout)



router.get( '/references', References.all);
router.get( '/reference/view/:id', References.view);
router.post('/references/create', upload.array('files', 4), References.create);
router.post('/references/edit/:id', upload.array('files', 4), References.edit);
router.post('/references/remove/:id', References.remove);
router.post('/references/remove/:id/image', References.removeImage);

router.get('/image/:dir/:img', Image.getImg);

export default router