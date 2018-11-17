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
import * as jwt from 'jsonwebtoken';


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
        router.get("/getSchedule", (req: Request, res: Response) => {
            console.log("/getSchedule called");
            try {
                SCHEDULE.findOne({}, (req, doc) => {
                    res.status(200).json(doc);
                });
            } catch (e) {
                this.logError(e);
            }
        });
        router.post("/auth/fb", Authenticator.authenticateFB,(req, res)=>{
            if(req.user.err){
                res.status(401).json({
                    success: false,
                    message: 'Auth failed',
                    error: req.user.err
                })
            }
            else if(req.user) {
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
            if(err) {
                console.log(err);
                res.status(400).json({success: false, message: 'Auth failed', err})
            }
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
        this.app.use(function (err, req, res, next) {
            if (err.name === 'UnauthorizedError') {
              Authenticator.unauthorizedHandler(err, req, res, next);
            }
        });
    }
}

export default new Server().app;