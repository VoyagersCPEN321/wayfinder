import { Request, Response } from "express";
import Parser from "./IcsParser";
import SCHEDULE from "../models/schedule";
import * as mongoose from "mongoose";
import USER, { IUser } from "../models/user";
import pushController from "../pushController";

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
            USER.find({ userId: req.user.userId }, (err, user) => {
                if (err) {
                    console.log("Error retrieving users from DB");
                    return;
                }
                if (!user) {
                    console.log("No users retrieved from DB");
                } else {
                    console.log("sent push notifications");
                    pushController.sendTestPushNotification((user[0] as IUser).expoPushToken);
                }
            });
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
        SCHEDULE.findOne({ userId: req.user.userId }, (err, doc) => {
            if (err) {
                console.log(req.user);
                this.handleError(err, res);
                return;
            } else if (!doc) {
                console.log("didn't find doc: " + req.user);
                let newSchedule = new SCHEDULE({
                    userId: req.user.userId,
                    events: events
                });
                newSchedule.save().then((doc) => {
                    res.status(200).json({ events: events });
                    return;
                }, (err) => this.handleError(err, res));
            } else {
                SCHEDULE.update({ userId: req.user.userId }, {
                    $set: {
                        events: events
                    }
                },
                    (err, doc) => {
                        if (err) {
                            this.handleError(err, res);
                            return;
                        } else if (doc) {
                            res.status(200).json({ events: events });
                            return;
                        } else {
                            res.status(500).json({
                                messsage: "Unexpected error 301A"
                            });
                        }
                    });
            }
        });
    }

    private handleError(err: any, res: Response) {
        console.log(err);
        res.status(500).json({
            message: err ? err.message : "Unexpected Error, please try again"
        });
    }
}

export default new IcsFileHandler();