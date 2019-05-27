const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mainValveSchema = new Schema(
    {
        mainValveId: {
            type: String,
            required: true,
            unique: true
        },
        name: String,
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
        rack: {
            type: Schema.Types.ObjectId,
            ref: "valveTable"
        },

        associatedWithPump: {
            type: Boolean,
            default: false
        },
        lastRequestTime: String,
        // Main Valve is active/inactive (sending requests or not)
        active: {
            type: Boolean,
            default: false
        },
        drainTime: {
            type: Number,
            default: 0
        },
        drainCount: {
            type: Number,
            default: 0
        },
        //calibration active false
        cB: {
            type: Boolean,
            default: false
        }

    }, { timestamps: true }
);

module.exports = mongoose.model('mainValve', mainValveSchema);