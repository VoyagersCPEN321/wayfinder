"use strict";

import * as mongoose from "mongoose";

class Event {
    private eventSchema: mongoose.Schema;
    public EVENT: mongoose.Model<mongoose.Document>;
    constructor() {
        // TODO: figure out the schema for a single event
        this.eventSchema = new mongoose.Schema({});
    }
}

export default new Event().EVENT;