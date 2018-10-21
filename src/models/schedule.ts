"use strict";

import * as mongoose from "mongoose";
import EVENT from "./event";
class Schedule {
    private scheduleSchema: mongoose.Schema;
    public SCHEDULE: mongoose.Model<mongoose.Document>;
    constructor() {
        this.scheduleSchema = new mongoose.Schema({
            userId: { type: mongoose.Schema.Types.ObjectId, unique: true },
            events: [EVENT.SCHEMA]
        });
        this.SCHEDULE = mongoose.model('Schedule', this.scheduleSchema);
    }
}

export default new Schedule().SCHEDULE;