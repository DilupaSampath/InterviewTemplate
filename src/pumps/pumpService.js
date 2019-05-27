const pumpModel = require('./pumpModel');
const logService = require('../logs/logService');
const dateService = require('../../services/dateService');
const mainValveService = require('../main-valve/mainValveService');
const eventService = require('../operations/operationEventService');
const operationService = require('../operations/operationService');
const commonService = require('../../services/commonServices');
const mongoose = require('mongoose');

/**
 * find pumps from the system according to the condition
 */
module.exports.findPumps = (condition) => {
    return new Promise((resolve, reject) => {
        pumpModel.find(condition).populate('mainValves.valveID').exec((err, valve) => {
            err ? reject(err) : resolve(valve);
        });
    })
};

/**
 * find pumps from the system according to the condition
 */
module.exports.getAllPumpsWithSortedValves = (pumpID) => {
    return new Promise((resolve, reject) => {
        pumpModel.aggregate([
            {
                $match: {
                    status: true,
                    "_id": mongoose.Types.ObjectId(pumpID)
                }
            },
            { $unwind: "$mainValves" },
            { $sort: { "mainValves.valveOrder": 1 } },
            {
                $group: {
                    seQuenceGap: { $first: '$seQuenceGap' },
                    lasteStartedTime: { $first: '$lasteStartedTime' },
                    _id: "$_id",
                    pumpId: { $first: '$pumpId' },
                    mainValves: { $push: "$mainValves" }
                }
            }
        ]).exec((err, pump) => {
            if (err) {
                reject(err)
            } else if (pump == null || pump == undefined || pump.length == 0) {
                reject("No pumps found")
            } else {
                resolve(pump[0]);
            }
        });
    })
};

/**
 * find next main valve to open
 */
module.exports.getPumpNextMainValveToOpen = (mainValve) => {
    return new Promise((resolve, reject) => {
        pumpModel.aggregate([
            {
                $match: {
                    status: true,
                    "mainValves.valveID": mongoose.Types.ObjectId(mainValve)
                }
            },
            { $unwind: "$mainValves" },
            { $sort: { "mainValves.valveOrder": 1 } },
            {
                $group: {
                    _id: "$_id",
                    pumpId: { $first: '$pumpId' },
                    mainValves: { $push: "$mainValves" }
                }
            }
        ]).exec((err, pump) => {
            if (err)
                reject(err)
            else if (pump == null || pump == undefined)
                reject("No pumps found")
            else
                resolve(pump);
        });
    })
};

/**
 * register new pump to the system
 */
module.exports.createNewPump = (pumpId) => {
    return new Promise(async (resolve, reject) => {
        let pump = new pumpModel();
        pump.pumpId = pumpId;
        try {
            //check pump availability
            let data = await this.findPumpByPumpID(pumpId);
            if (data == null || data == undefined) {
                //create new pump
                pump.save((err, pump) => {
                    err ? reject(err) : resolve(pump);
                });
            } else {
                reject("Pump already registered");
            }
        } catch (error) {
            reject("" + error);
        }
    })
}

/**
 * find pump by pumpID
 */
module.exports.findPumpByPumpID = (pumpId) => {
    return new Promise((resolve, reject) => {
        pumpModel.findOne({ pumpId: pumpId }, (err, pump) => {
            err ? reject(err) : resolve(pump);
        });
    })
}

/**
 * find pump by pumpID
 */
module.exports.findPumpByPumpIDWithPopulate = (pumpId) => {
    return new Promise((resolve, reject) => {
        pumpModel.findOne({ pumpId: pumpId })
            .populate('mainValves.valveID')
            .exec((err, pump) => {
                err ? reject(err) : resolve(pump);
            });
    })
}

/**
 * find valve by pumpId and update
 */
module.exports.findByPumpIdAndUpdate = (pumpId, data) => {
    data.status = true;
    return new Promise((resolve, reject) => {
        pumpModel.findOneAndUpdate({ pumpId: pumpId },
            data,
            { new: true },
            async (err, pump) => {
                if (err)
                    reject(err)
                else if (
                    (data.mainValves != null || data.mainValves != undefined)
                    && (pump != null || pump != undefined)
                ) {
                    try {
                        let mainValves = [];
                        data.mainValves.forEach(valve => {
                            mainValves.push(valve.valveID);
                        });
                        await mainValveService.bulkUpdateMainValves(
                            mainValves,
                            { associatedWithPump: true });
                        resolve(pump);
                    } catch (error) {
                        reject("" + error);
                    }
                }
                else
                    resolve(pump);
            });
    })
}

/**
 * find valve by pumpId and update
 */
module.exports.findByPumpIdAndUpdateCron = (pumpId, data) => {
    return new Promise((resolve, reject) => {
        pumpModel.findOneAndUpdate({ pumpId: pumpId },
            data,
            { new: true },
            async (err, pump) => {
                if (err) reject(err)
                else resolve(pump);
            });
    })
}

/**
 * create new  pump or get power status of the pump
 */
module.exports.createOrGetPowerStatus = (url, pumpId, status) => {
    return new Promise(async (resolve, reject) => {
        try {
            //create log
            await logService.createNewLog({
                data: { deviceId: pumpId, data: status },
                url: url,
                type: "pump"
            })

            const currentTimeInMilliseconds =
                new Date(dateService.getSriLankanDateTime()).getTime();

            let pump = await this.findByPumpIdAndUpdateCron(
                pumpId,
                { "lastRequestTime": currentTimeInMilliseconds });

            if (pump == null || pump == undefined) {
                await this.createNewPump(pumpId)
                resolve("Pump created")

            } else if (status && pump.pS) {
                eventService.emitDataToListener(pumpId + 'pump-open', pumpId);

            } else if (!status && !pump.pS) {
                eventService.emitDataToListener(pumpId + "pump-close", pumpId);
            }
            var mainValveDetails;
            if (pump.pS) {
                let mainValves = [];
                pump.mainValves.forEach(valve => {
                    mainValves.push(valve.valveID);
                });
                //get power on valve
                let mainValve = await mainValveService.findValveWithPowerStatusOn(mainValves);

                //get main valve details from pump
                mainValveDetails = await this.getMainValveDetails(mainValve._id);
            }
            resolve({
                pS: pump.pS,
                d: pump.pS ?
                    mainValve.cB ? 0 :
                        commonService
                            .convertSecondToMilliseconds(
                                (+mainValveDetails[0].mainValves[0].duration).toFixed(0)) : 0
            });
            var startTime = pump.sT.find((time) => {
                return time === dateService.startTime();
            })
            if (startTime) {
                try {
                    await operationService.startSequence(pump._id);
                } catch (error) {
                    console.log(error)
                }
            }
        } catch (error) {
            reject('' + error);
        }
    });
}

/**
 * update main valve drain time
 */
module.exports.updateValveDrainTime = (mainValveId, duration) => {
    return new Promise(async (resolve, reject) => {
        pumpModel.findOneAndUpdate(
            { 'mainValves.valveID': mainValveId },
            { $set: { 'mainValves.$.duration': duration } },
            (error, data) => {
                if (error) {
                    reject(error);
                } else if (data == null || data == undefined) {
                    reject("Invalid main valveId")
                } else {
                    resolve(data);
                }
            }
        )
    })
}

/**
 * update main valve drain time
 */
module.exports.getMainValveDetails = (mainValveId) => {
    return new Promise(async (resolve, reject) => {
        pumpModel.aggregate([
            { $match: { "mainValves.valveID": mongoose.Types.ObjectId(mainValveId) } },
            {
                $project: {
                    mainValves: {
                        $filter: {
                            input: "$mainValves",
                            as: "mainValves",
                            cond: { $eq: ["$$mainValves.valveID", mainValveId] }
                        }
                    }
                }
            }
        ], (error, data) => {
            if (error) {
                reject(error);
            } else if (data == null || data == undefined) {
                reject("Invalid main valveId")
            } else {
                resolve(data);
            }
        }
        )
    })
}

/**
 * remove pump from the system
 */
module.exports.deletePump = (pumpId) => {
    return new Promise((resolve, reject) => {
        pumpModel.findOneAndDelete({ pumpId: pumpId },
            async (err, pump) => {
                if (err)
                    reject(err)
                else if (pump != null || pump != undefined) {
                    try {
                        let mainValves = [];
                        pump.mainValves.forEach(valve => {
                            mainValves.push(valve.valveID);
                        });
                        await mainValveService.bulkUpdateMainValves(
                            mainValves,
                            { associatedWithPump: false });
                        resolve("Pump successfully deleted");
                    } catch (error) {
                        reject("" + error);
                    }
                } else
                    reject("Invalid pumpId");
            });
    })
}

/**
 * update main valve functioning status
 */
module.exports.updateFunctionStatus = (mainValveID, status) => {
    return new Promise((resolve, reject) => {
        pumpModel.findOneAndUpdate({ "mainValves.valveID": mainValveID },
            { "mainValves.$.status": status },
            { safe: true, new: true },
            async (err, pump) => {
                if (err)
                    reject(err)
                else if (pump != null || pump != undefined) {
                    resolve(pump);
                } else
                    reject("Invalid mainValveId");
            });
    })
}