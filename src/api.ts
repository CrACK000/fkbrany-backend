import express from 'express';
import cors from 'cors';
import router from './router';
import passport from './plugins/passport';
import bodyParser from 'body-parser';

export const app = express();

app.set('trust proxy', true);

app.use(cors({ origin: process.env.FRONTEND, credentials: true }));

app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session(undefined))
app.use(bodyParser.json())

app.use('/api/v1', router);
