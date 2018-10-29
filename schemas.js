"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
class Models {
    constructor() {
        this.USER = mongoose.model("User", this.userSchema);
        this.userSchema = new mongoose.Schema({
            _id: mongoose.Schema.Types.ObjectId,
            email: String
        });
    }
}
exports.Models = Models;
exports.default = new Schemas();
