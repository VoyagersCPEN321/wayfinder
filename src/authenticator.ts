
import * as expressJwt from "express-jwt";
import * as express from "express";
import { Request, Response } from "express";
import * as passport from 'passport';
import * as FacebookTokenStrategy from 'passport-facebook-token';
import * as jwt from 'jsonwebtoken';
import * as mongoose from "mongoose";
import USER from './models/user';
import { ObjectID } from "bson";

export interface IAuthenticator {
    authenticateFB: express.RequestHandler;
    validateUserToken: expressJwt.RequestHandler;
    getUserToken(user: mongoose.Document): string;
    unauthorizedHandler(err: any, req: Request, res: Response, next: any): void;
}

class Authenticator implements IAuthenticator {
    // TODO use a local file instead of a hardcoded secret or ENV_VAR
    // var publicKey = fs.readFileSync('/path/to/public.pub');
    // jwt({ secret: publicKey });
    private APP_SECRET = 'my-secret';
    private APP_ID = '171287213807359';

    /* IAuthenticator */
    public authenticateFB: express.RequestHandler;
    public validateUserToken: expressJwt.RequestHandler;

    constructor() {
        /* Init FB authenticator using passport. */
        passport.use('facebook-token', new FacebookTokenStrategy({
            clientID: this.APP_ID,
            clientSecret: this.APP_SECRET,
            enableProof: false
        }, (accessToken, refreshToken, profile: FacebookTokenStrategy.Profile, done) => {
            USER.findOne({ facebookId: profile.id }).then((user: mongoose.Document) => {
                if (!user) {
                    let newUser = new USER({
                        userId: new ObjectID(),
                        facebookId: profile.id,
                        name: profile.name.givenName
                    });
                    newUser.save((err: any, savedUser: mongoose.Document) => {
                        return done(err, savedUser);
                    });
                }
                return done(null, user);
            });
        }));
        this.authenticateFB = passport.authenticate('facebook-token', { session: false });

        /* Init user token validator */
        this.validateUserToken = expressJwt({
            secret: this.APP_SECRET,
            requestProperty: 'auth-token',
            getToken: function (req: Request) {
                console.log(req.headers);
                if (req.headers['x-auth-token']) {
                    return req.headers['x-auth-token'];
                }
                console.log("got here whyyyy\n");
                return null;
            }
        });
    }

    public getUserToken(user: mongoose.Document): string {
        if (user) {
            return jwt.sign(user.toJSON(), this.APP_SECRET);
        }
        return null;
    }

    public unauthorizedHandler(err: any, req: Request, res: Response, next: any) {
        if (err.name === 'UnauthorizedError') {
            // TODO add a meaningful error message
            res.status(401).send('Please Login.');
            return;
          }
    }
}

export default new Authenticator();
