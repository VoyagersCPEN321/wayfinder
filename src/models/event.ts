"use strict";

import * as mongoose from "mongoose";
import { defaultCipherList } from "constants";

/*
  [ [ 'dtstamp', {}, 'date-time', '2018-10-16T01:39:36Z' ],
    [ 'rrule', {}, 'recur', [Object] ],
    [ 'summary', {}, 'text', 'CPEN 311 101' ],
    [ 'location', {}, 'text', 'MacLeod, Room 228' ],
    [ 'description', {}, 'text', '' ],
    [ 'dtstamp', {}, 'date-time', '2018-10-16T01:39:36Z' ],
    [ 'uid', {}, 'text', '12341539653976597abcd137620' ],
    [ 'dtstart', [Object], 'date-time', '2018-09-04T12:30:00' ],
    [ 'dtend', [Object], 'date-time', '2018-09-04T14:00:00' ] ],

*/

export interface IEvent extends mongoose.Document {
    summary: String;
    day: String;
    location: String;
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