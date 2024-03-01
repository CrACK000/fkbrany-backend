import passport from 'passport';
import { getDb } from '../../plugins/db';
import { ObjectId } from 'mongodb';

export class Authentication {

  static async login(req: any, res: any, next: any) {

    await passport.authenticate('local', function (err: any, user: any) {

      if (err) {
        console.error('Server error')
        return res.send({ success: false });
      }

      if (!user) {
        console.error('Server error')
        return res.send({ success: false });
      }

      req.logIn(user, function(err: any) {

        if (err) {
          console.error('Server error')
          return res.send({ success: false });
        }

        const id = new ObjectId(String(user._id))
        const last_login = getDb().collection('admin').updateOne({ _id: id }, { $set: { last_login: new Date() } })

        if (!last_login) {
          console.log('Error DB: last_login not updated.')
        }

        return res.send({ success: true, loggedIn: true, user: user });

      });

    })(req, res, next);

  }

  static async checkAuth(req: any, res: any) {

    if(req.user) {

      res.send({ loggedIn: true, user: req.user });

    } else {

      res.send({ loggedIn: false, user: null });

    }

  }

  static async logout(req: any, res: any) {

    req.logout(function (err: any) {

      if (err) {

        console.log(err);
        res.send({ success: false });

      } else {

        res.send({ success: true, message: "Bol si odhlásený z účtu." });

      }

    });

  }

}