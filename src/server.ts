/*
 * Code to just get things going with the setup.
 * Copied from: https://brianflove.com/2016/03/29/typescript-express-node-js/
 */

"use strict";

import Parser from "./parsing/IcsParser";
import SCHEDULE from "./models/schedule";
import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import * as mongoose from "mongoose";
import { ObjectID } from "bson";
import locationsMap from "./parsing/locationsMap";
import Authenticator from "./authenticator";

// TODO revisit error handling to have more
// meaningful error handling and error messages
/**
 * The server.
 *
 * @class Server
 */
export class Server {

    public app: express.Application;
    private db: mongoose.Connection;
    /**
     * Constructor.
     *
     * @class Server
     * @constructor
     */
    constructor() {
        this.app = express();

        //configure application
        try {
            this.config();
            this.routes();
            this.errorHandler();
            console.log("Server init completed.");
        } catch (e) {
            this.logError(e);
        }
    }

    private config(): void {
        try {
            this.app.use(bodyParser.json());
            this.app.use(bodyParser.urlencoded({ extended: false }));
            mongoose.connect("mongodb://localhost/test").then(() => {
                locationsMap.config().then((result) => {
                    if (result) {
                        SCHEDULE.findOne((query, doc) => {
                            if (!doc) {
                                let events = Parser.parseICS('fakeICS');
                                let newSchedule = new SCHEDULE({
                                    userId: new ObjectID(),
                                    events: events
                                });
                                newSchedule.save().then(() => console.log("populatedDB"));
                            } else {
                                console.log("DB already populated.");
                            }
                        });
                    } else {
                        console.log("failed to init locationsMap");
                    }
                });
            });
            console.log("Config complete.");
        } catch (e) {
            this.logError(e);
        }
    }

    private routes(): void {
        const router = express.Router();
        router.get("/schedule", Authenticator.validateUserToken, (err: any, req: Request, res: Response) => {
            console.log("/schedule called");
            if (err) {
                res.send(401); // unauthorized error.
                return;
            }
            if (!req.user) {
                res.send(401);
                return;
            }
            SCHEDULE.findOne({userId: req.user.userId }, (req, doc) => {
                if (!doc) {
                    res.send(404);
                    return;
                }
                res.status(200).json(doc);
            });
        });

        router.post("/schedule", Authenticator.validateUserToken, (req: Request, res: Response) => {
            if (!req.user) {
                res.send(401);
                return;
            }
            try {
                // TODO put the ics in here
                let events = Parser.parseICS('fakeICS');
                let newSchedule = new SCHEDULE({
                    userId: req.user.userId,
                    events: events
                });
                SCHEDULE.findOneAndUpdate({ userId: req.user.userId }, { events: events }, { upsert: true }, (err, doc) => {
                    if (err || !doc) {
                        res.send(500).json({
                            message: err ? err.message : "Unexpected Error, please try again"
                        });
                        return;
                    }
                    res.send(200).json(doc);
                    return;
                });
            } catch (e) {
                res.send(500).json({
                    message: e.message
                });
            }

        }, (err, res) => {
            if (err) {
                console.log(err);
                res.status(400).json({ success: false, message: 'Auth failed', err });
            }
            return;
        });


        router.post("/auth/fb", Authenticator.authenticateFB, (req, res) => {
            if (req.user.err) {
                res.status(401).json({
                    success: false,
                    message: 'Auth failed',
                    error: req.user.err
                });
            } else if (req.user) {
                res.status(200).json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: Authenticator.getUserToken(req.user),
                    user: req.user
                });
            } else {
                res.status(401).json({
                    success: false,
                    message: 'Auth failed'
                });
            }
        }, (err, req, res, next) => {
            if (err) {
                console.log(err);
                res.status(400).json({ success: false, message: 'Auth failed', err });
            }
            return;
        });

        router.get("/validate", Authenticator.validateUserToken, (req: Request, res: Response) => {
            console.log("/validate called");
            try {
                SCHEDULE.findOne({}, (req, doc) => {
                    res.status(200).json(doc);
                });
            } catch (e) {

                this.logError(e);
            }
        }, (err, res) => {
            console.log("error here \n");
            res.status(401).json({
                success: false,
                message: 'Auth failed'
            });
        });

        this.app.use("/", router);
    }

    private logError(e: Error): void {
        console.log("Encountered Error : " + e);
    }

    private errorHandler(): void {
        this.app.use((err: any, req: Request, res: Response, next: any) => {
            if (err.name === 'UnauthorizedError') {
                Authenticator.unauthorizedHandler(err, req, res, next);
            }
            return;
        });
    }
}

export default new Server().app;