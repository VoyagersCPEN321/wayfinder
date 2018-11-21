import { Request, Response } from "express";
import Parser from "./IcsParser";
import SCHEDULE from "../models/schedule";
import * as mongoose from "mongoose";

export interface IFileUploadHandler {
    handleRequest(req: Request, res: Response);
}

export class IcsFileHandler implements IFileUploadHandler {
    public handleRequest(req: Request, res: Response) {
        if (!req.user) {
            res.send(401);
            return;
        }
        try {
            if (req.body && req.body.icsData) {
                let events = Parser.parseICS(req.body.icsData);
                this.upsertSchedule(req, res, events);
                return;
            } else {
                res.status(500).json({
                    message: "No data was sent to the server!"
                });
                return;
            }
        } catch (err) {
            this.handleError(err, res);
            return;
        }
    }

    private upsertSchedule(req: Request, res: Response, events: mongoose.Document[]) {
        let updatedSchedule = new SCHEDULE({
            userId: req.user.id,
            events: events
        });
        SCHEDULE.findOneAndUpdate({ userId: req.user.userId }, {userId: req.user.id, events: events}, { upsert: true }, (err, doc) => {
            if (err) {
                this.handleError(err, res);
                return;
            } else if (!doc) {
                console.log("upsert schedule didn't return doc");
                console.log("didn't found doc: "+ req.user);
                let newSchedule = new SCHEDULE({
                    userId: req.user.userId,
                    events: events
                });
                newSchedule.save().then((doc) => {
                    res.status(200).json(doc);
                    return;
                }, err => this.handleError(err, res));
            } else {
                console.log("found doc: "+ req.user);
                console.log(doc);
                res.status(200).json(doc);
                return;
            }
        });
    }

    private handleError(err: any, res: Response) {
        res.status(500).json({
            message: err ? err.message : "Unexpected Error, please try again"
        });
    }
}

export default new IcsFileHandler();