/*
 * Code to just get things going with the setup.
 * Copied from: https://brianflove.com/2016/03/29/typescript-express-node-js/
 */

"use strict";

import * as express from "express";
import * as bodyParser from "body-parser";
import * as path from "path";
import { Request, Response } from "express";

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
    }
    private routes(): void {
        const router = express.Router();

        router.get("/", (req: Request, res: Response) => {
            res.status(200).send({
                message: "Howdy!"
            });
        });

        this.app.use("/", router);
    }
}

export default new Server().app;