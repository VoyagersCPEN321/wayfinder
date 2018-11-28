import { Request, Response } from "express";
import Parser from "./IcsParser";
import SCHEDULE from "../models/schedule";
import * as mongoose from "mongoose";
import USER, { IUser } from "../models/user";
import pushController from "../pushController";

export interface IFileUploadHandler {
    handleRequest(req: Request, res: Response);
}
/**
 * Handles ics file uploads to the server.
 */
export class IcsFileHandler implements IFileUploadHandler {
    public handleRequest(req: Request, res: Response) {
        /* If user is not authenticated send a 401. */
        if (!req.user) {
            res.send(401);
            return;
        }
        try {
            /* Check if request has ics Data on its body. */
            if (req.body && req.body.icsData) {
                /* Parse ics events from the user sent file and upsert into the db */
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
    /**
     * If the user has a previously inserted schedule update it,
     * else insert a new entry for the user.
     */
    private upsertSchedule(req: Request, res: Response, events: mongoose.Document[]) {
        SCHEDULE.findOne({ userId: req.user.userId }, (err, doc) => {
            if (err) {
                console.log(req.user);
                this.handleError(err, res);
                return;
            } else if (!doc) {
                /**
                 *  We didn't find any previously stored schedules so
                 *  we will insert a new one into the db.
                 */
                console.log("UPSERT: didn't find schedule, inserting new entry for: " + req.user);
                let newSchedule = new SCHEDULE({
                    userId: req.user.userId,
                    events: events
                });
                newSchedule.save().then((doc) => {
                    pushController.setupUserPushNotificationsForToday(req.user);
                    res.status(200).json({ events: events });
                    return;
                }, (err) => this.handleError(err, res));
            } else {
                /**
                 * Found an already existing entry, just update it.
                 */
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
                            pushController.setupUserPushNotificationsForToday(req.user);
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

    /**
     * Error handler and logger.
     */
    private handleError(err: any, res: Response) {
        console.log(err);
        res.status(500).json({
            message: err ? err.message : "Unexpected Error, please try again"
        });
    }
}

export default new IcsFileHandler();