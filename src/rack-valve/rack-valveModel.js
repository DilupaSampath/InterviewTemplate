var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var valveSchema = new Schema({
    DeviceId: {
        type: Schema.Types.Mixed,
        required: true,
        unique: true
    },

    // waiting time in milliseconds
    wT: {
        type: Number,
        default: 1000
    },

    // draining time in milliseconds
    dT: {
        type: Number,
        default: 1000
    },

    oldWaitingTime: {
        type: Number
    },

    oldDrainingTime: {
        type: Number
    },

    //row
    Location: {
        type: String,
        required: false,
    },
    RackName: {
        type: String,
        required: false,
    },
    //column
    LineNumber: {
        type: String,
        required: false,
    },
    // Registered or not
    status: {
        type: Boolean,
        required: false,
        default: false
    },
    channel: {
        type: Number,
        required: false
    },
    // Power status
    pS: {
        type: Boolean,
        default: false
    },

    // currently draining tier
    drainingTier: {
        type: String,
        default: 0
    },

    // Registered with a main valve or not
    associatedWithMainValve: {
        type: Boolean,
        default: false
    },
    lastRequestTime: {
        type: String
    },
    // Valve is active/inactive (sending requests or not)
    active: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('valveTable', valveSchema);
