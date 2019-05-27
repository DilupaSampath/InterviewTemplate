const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pumpSchema = new Schema({

    log: {
        type: Schema.Types.Mixed
    },
    type: {
        type: String
    },
    createdAt: {
        type: String
    },
    url: {
        type: String
    }

}, { timestamps: true });

module.exports = mongoose.model('log', pumpSchema);