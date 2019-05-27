const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pumpSchema = new Schema({
    pumpId: {
        type: Schema.Types.Mixed,
        required: true,
        unique: true
    },

    name: {
        type: String
    },

    // Registered or not
    status: {
        type: Boolean,
        default: false
    },

    // Power status
    pS: {
        type: Boolean,
        default: false
    },

    // Duration of pump ON time in seconds
    duration: {
        type: Number
    },

    mainValves: [{
        valveID: {
            type: Schema.Types.ObjectId,
            ref: "mainValve"
        },
        valveOrder: Number,
        duration: {
            type: Number,
            default: 0
        },
        status: {
            type: Boolean,
            default: true
        }
    }],

    lastRequestTime: Date,
    lasteStartedTime: Date,
    //gap between two sequence for avoid confliting Should be in Seconds
    seQuenceGap: Number,
    // Pump is active/inactive (sending requests or not)
    active: {
        type: Boolean,
        default: false
    },

    // Array of starting times
    sT: [{
        type: String
    }],

    // Delay between main valves in seconds
    delayBetweenMainValves: {
        type: Number
    },

    nutrient_id: {
        type: String
    },

});

module.exports = mongoose.model('pump', pumpSchema);