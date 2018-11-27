"use strict";

import * as mongoose from "mongoose";

export interface IEvent extends mongoose.Document {
    summary: String;
    day: String;
    location: String;
    room: String;
    building: String;
    description: String;
    startTime: Date;
    endTime: Date;
    startDay: Date;
    lastDay: Date;
    frequency: String;
    recurrence: Number;
}

export class Event {
    public SCHEMA: mongoose.Schema;
    public MODEL: mongoose.Model<mongoose.Document>;
    private DAYS: String[] = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
    private FREQUENCY: String[] = ["SECONDLY", "MINUTELY", "HOURLY", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"];
    constructor() {
        this.SCHEMA = new mongoose.Schema({
            summary: { type: String, required: true },
            day: {
                type: String,
                enum: this.DAYS,
                required: true
            },
            location: { type: String, required: true },
            room: {type: String, required: true },
            building: { type: String, required: true },
            description: String,
            startTime: { type: Date, required: true },
            endTime: { type: Date, required: true },
            startDay: { type: Date, required: true },
            lastDay: { type: Date, required: true },
            frequency: {
                type: String,
                enum: this.FREQUENCY,
                required: true
            },
            recurrence: Number
        });
        this.MODEL = mongoose.model<IEvent>('Event', this.SCHEMA);
    }
}

export default new Event();