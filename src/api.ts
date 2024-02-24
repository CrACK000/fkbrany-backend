import express from 'express';
import cors from 'cors';
import router from './router';
import passport from './plugins/passport';
import { closeDb, connectToDb } from './db';
import bodyParser from 'body-parser';

export const app = express();

app.set('trust proxy', true);

app.use(async (req, res, next) => {
  try {
    await connectToDb();
    next();
  } catch (error) {
    next(error);
  }
});

app.use(cors({ origin: process.env.FRONTEND, credentials: true }));

app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session(undefined))
app.use(bodyParser.json())

app.use('/api/v1', router);

process.on('SIGINT', async () => {
  await closeDb();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDb();
  process.exit(0);
});
