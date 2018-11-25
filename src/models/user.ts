"use strict";

import * as mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    userId: mongoose.Schema.Types.ObjectId;
    facebookId: string;
    name: string;
    expoPushToken: String;
}

class User {
    private userSchema: mongoose.Schema;
    public USER: mongoose.Model<mongoose.Document>;
    constructor() {
        // TODO add validation over email field
        this.userSchema = new mongoose.Schema({
            userId: mongoose.Schema.Types.ObjectId,
            facebookId: { type: String, unique: true },
            name: String,
            expoPushToken : {type:String, default: null},
        });

        this.USER = mongoose.model<IUser>('User', this.userSchema);
    }
}

export default new User().USER;