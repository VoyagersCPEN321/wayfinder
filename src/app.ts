/*
 * Code to just get things going with the setup.
 * Copied from: https://brianflove.com/2016/03/29/typescript-express-node-js/
 */

"use strict";

import USER from "./models/user";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as path from "path";
import { Request, Response } from "express";
import * as mongoose from "mongoose";
import * as assert from "assert";

/**
 * The server.
 *
 * @class Server
 */
export class Server {

    public app: express.Application;
    /**
     * Constructor.
     *
     * @class Server
     * @constructor
     */
    constructor() {
        //create expressjs application
        this.app = express();

        //configure application
        this.config();
        this.routes();
    }

    private config(): void {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        mongoose.connect("mongodb://localhost/test");
        let db = mongoose.connection;
        db.once('open', () => {
            console.log("connected successfully");
            let newUser = new USER({
                _id: new mongoose.Types.ObjectId,
                email: "fakeEmail"
            });
            newUser.save().then(() => {
                USER.findById(newUser._id, (err: any, res: mongoose.Document) => {
                    assert(err === null);
                    console.log(res);
                    USER.find({}, (err: any, res: mongoose.Document[]) => {
                        assert(err === null);
                        res.forEach( entry => console.log(entry));
                        console.log("closed connection successfully");
                        db.close();
                    });
                });
            });
        });
    }

    private routes(): void {
        const router = express.Router();

        router.get("/", (req: Request, res: Response) => {
            res.status(200).send({
                message: "Howdy!"
            });
        });

        // in case you want to experiment with Models and requests
        // router.get("/deleteAllUsers", (req: Request, res: Response) => {
        //     USER.find({}, () => {

        //     }).remove();
        //     res.status(200).send({
        //         message: "Howdy!"
        //     });
        // });

        this.app.use("/", router);
    }
}

export default new Server().app;