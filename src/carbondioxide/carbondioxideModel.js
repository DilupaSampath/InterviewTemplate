const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const co2SensorSchema = new Schema({
    minimumLimit: {
        type: Number,
        default: 1500
    },
    deviceId: {
        type: String
    },

    status: {
        type: Boolean,
        default: false
    },
    testMode: {
        type: Boolean,
        default: false
    },
    // Power status
    pS: {
        type: Boolean,
        default: false
    },

    currentGas: {
        type: Number
    },

    noOfCylinders: {
        type: Number
    },

    lastUpdatedTime: {
        type: Date
    },

    location: {
        type: String
    },
    name: {
        type: String,
    }
});

module.exports = mongoose.model('carbondioxide', co2SensorSchema);