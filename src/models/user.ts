"use strict";

import * as mongoose from "mongoose";

class User {
    private userSchema: mongoose.Schema;
    public USER: mongoose.Model<mongoose.Document>;
    constructor() {
        // TODO add validation over email field
        this.userSchema = new mongoose.Schema({
            _id: mongoose.Schema.Types.ObjectId,
            email: String
        });
        this.USER = mongoose.model('User', this.userSchema);
    }
}

export default new User().USER;