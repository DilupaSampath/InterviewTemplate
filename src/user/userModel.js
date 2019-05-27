const crypto = require('crypto');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// create user Schema
const UserSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        salt: String,
    },
    { timestamps: true }
);

// validate password with the database
UserSchema.methods.validPassword = function (password) {
    const hash = crypto
        .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
        .toString('hex');
    return this.password === hash;
};
// encrypt the password before save
UserSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.password = crypto
        .pbkdf2Sync(password, this.salt, 10000, 512, 'sha512')
        .toString('hex');
};

module.exports = mongoose.model('User', UserSchema);
