/*
 * Code to just get things going with the setup.
 * Copied from: https://brianflove.com/2016/03/29/typescript-express-node-js/
 */

"use strict";

import SCHEDULE from "./models/schedule";
import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import * as mongoose from "mongoose";
import locationsMap from "./parsing/locationsMap";
import Authenticator from "./authenticator";
import IcsFileHandler from "./parsing/icsFileHandler";
import PushController from "./pushController";
var moment = require('moment');

let nodeScheduler = require('node-schedule');

const PROD_DB_LOCATION = "mongodb://localhost/prod";
const UNAUTHORIZED = 'UnauthorizedError';
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
    constructor(dbLocation: string) {
        this.app = express();

        //configure application
        try {
            this.config(dbLocation);
            this.routes();
            this.errorHandler();
            console.log("Server init completed.");
        } catch (e) {
            this.logError(e);
        }
    }

    private config(dbLocation: string): void {
        try {
            this.app.use(bodyParser.json());
            this.app.use(bodyParser.urlencoded({ extended: false }));
            mongoose.connect(dbLocation).then(() => {
                locationsMap.config().then((result) => {
                    if (!result) {
                        console.log("failed to init locationsMap");
                    }
                });
            });
            console.log("Config complete.");
            (PushController.setupDailyPushNotifications())();
            nodeScheduler.scheduleJob('1 0 0 * * *', PushController.setupDailyPushNotifications());
        } catch (e) {
            this.logError(e);
        }
    }

    private routes(): void {
        const router = express.Router();
        router.get("/schedule", Authenticator.validateUserToken, (req: Request, res: Response) => {
            console.log("/schedule called");
            if (!req.user) {
                res.send(401);
                return;
            }
            if (req.user.err) {
                console.log(req.user.err);
                res.sendStatus(401);
                return;
            }
            /* Don't return userId */
            SCHEDULE.findOne({userId: req.user.userId }, {userId: 0}, (err, doc) => {
                if (err) {
                    this.logError(err);
                    res.status(500).json({
                        message: err
                    });
                } else if (!doc) {
                    res.status(404).json({
                        message: "No Schedule found, Please upload your schedule!"
                    });
                } else {
                    res.status(200).json(doc);
                }
            });
        });

        router.post("/schedule", Authenticator.validateUserToken, (req: Request, res: Response) => {
            IcsFileHandler.handleRequest(req, res);
        });


        router.post("/auth/fb", Authenticator.authenticateFB, (req, res) => {
            if (req.user.err) {
                res.status(401).json({
                    success: false,
                    message: 'Auth failed',
                    error: req.user.err
                });
            } else if (req.user) {
                console.log(req.body.token);
                PushController.getUserPushToken(req);
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
        });

        this.app.use("/", router);
    }

    private logError(e: Error): void {
        console.log("Encountered Error : " + e + "\n" + e.stack);
    }

    private errorHandler(): void {
        this.app.use((err: any, req: Request, res: Response, next: any) => {
            if (err.name === UNAUTHORIZED) {
                Authenticator.unauthorizedHandler(err, req, res, next);
            } else if (!res.headersSent) {
                this.logError(err);
                res.status(500).json({ success: false, message: err.message });
            }
        });
    }
}

export default new Server(PROD_DB_LOCATION).app;