const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    wishlist: {
        type: Array,
        default: []
    }
});

const UserModel = mongoose.model("users", UserSchema);
module.exports = UserModel;