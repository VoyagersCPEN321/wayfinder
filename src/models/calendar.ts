"use strict";

import * as mongoose from "mongoose";

class Calendar {
    private calendarSchema: mongoose.Schema;
    public CALENDAR: mongoose.Model<mongoose.Document>;
    constructor() {
        this.calendarSchema = new mongoose.Schema({
            userId: mongoose.Schema.Types.ObjectId,
            calendar: String
        });
        this.CALENDAR = mongoose.model('Calendar', this.calendarSchema);
    }
}

export default new Calendar().CALENDAR;