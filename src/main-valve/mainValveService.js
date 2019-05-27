const mainValveModel = require('./mainValveModel');
const dateService = require('../../services/dateService');
const rackService = require('../rack-valve/rack-valveService');
const logService = require('../logs/logService');
const evenService = require('../operations/operationEventService');
const rackModel = require('../rack-valve/rack-valveModel');
const pumpService = require('../pumps/pumpService');

/**
 * find valve from the system
 */
module.exports.findValves = (condition) => {
    return new Promise((resolve, reject) => {
        mainValveModel.find(condition).populate('rack').exec((err, valve) => {
            err ? reject(err) : resolve(valve);
        });
    })
};

module.exports.getAll = (condition) => {
    return new Promise((resolve, reject) => {
        mainValveModel.find(condition).populate('rack').exec((err, valve) => {
            err ? reject(err) : resolve(valve);
        });
    })
};
/**
 * delete valve from the system
 */
module.exports.deleteValves = (deviceId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let mainValve = await this.findOneValve(deviceId)
            if (mainValve == null || mainValve == undefined)
                reject("Invalid main valve id")
            else {
                let rack = rackService.findByIdAndUpdate(
                    mainValve.rack,
                    { 'associatedWithMainValve': false })
                if (rack == null || rack == undefined)
                    reject("Unable to detach rack")
                else {
                    mainValveModel.findOneAndDelete(
                        { mainValveId: deviceId },
                        (err, valve) => {
                            err ? reject(err) : resolve(valve);
                        });
                }
            }
        } catch (error) {
            reject('' + error);
        }
    })
};

/**
 * register new valve to the system
 */
module.exports.createValve = (valveData) => {
    return new Promise(async (resolve, reject) => {
        try {
            let mainValve = new mainValveModel();
            mainValve.mainValveId = valveData.mainValveId;
            mainValve.name = valveData.name;
            mainValve.rack = valveData.rack;
            mainValve.save(async (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    await rackService.findByIdAndUpdate(
                        valveData.rack,
                        { associatedWithMainValve: true })
                    resolve(data);
                }
            })
        } catch (error) {
            reject('' + error)
        }
    });
}

/**
 * find valve by deviceID and update
 */
module.exports.findValveByDeviceIDAndUpdate = (deviceId, data) => {
    data.status = true;
    return new Promise((resolve, reject) => {
        mainValveModel.findOneAndUpdate({ mainValveId: deviceId },
            data,
            { new: true },
            async (err, rack) => {
                if (err)
                    reject(err)
                else if (
                    (data.rack != null ||
                        data.rack != undefined) &&
                    (rack != null ||
                        rack != undefined)) {
                    let response = await rackService.findByIdAndUpdate(
                        data.rack,
                        { 'associatedWithMainValve': true })
                    if (response == undefined || response == null)
                        reject("Error updating rack")
                    else
                        resolve(rack)
                }
                else
                    resolve(rack);
            });
    })
}

/**
 * find valve by deviceID and update
 */
module.exports.findValveByDeviceIDAndUpdateCron = (deviceId, data) => {
    return new Promise((resolve, reject) => {
        mainValveModel.findOneAndUpdate({ mainValveId: deviceId },
            data,
            { new: true },
            async (err, rack) => {
                if (err) reject(err)
                else resolve(rack);
            });
    })
}

/**
 * find valve from the system by mainValveId
 */
module.exports.findOneValve = (mainValveId) => {
    return new Promise((resolve, reject) => {
        mainValveModel.findOne({ mainValveId: mainValveId })
            .populate('rack')
            .exec((err, valve) => {
                err ? reject(err) : resolve(valve);
            });
    })
};

/**
 * create new main valve or get power status of the main valve
 */
module.exports.createOrGetPowerStatus = (url, deviceID, status) => {
    return new Promise(async (resolve, reject) => {
        try {
            //create log
            await logService.createNewLog({
                data: { deviceId: deviceID, data: status },
                url: url,
                type: "main-valve"
            })

            let mainValve = await this.findValveByDeviceIDAndUpdateCron(
                deviceID,
                { "lastRequestTime": new Date(dateService.getSriLankanDateTime()).getTime() });

            if (mainValve == null || mainValve == undefined) {
                await this.createValve({ mainValveId: deviceID })
                resolve("Main valve created")

            } else if (status && mainValve.pS) {
                evenService.emitDataToListener(deviceID + 'main-valve-open', deviceID);

            } else if (!status && mainValve.pS) {
                evenService.emitDataToListener(deviceID + "main-valve-close", deviceID);
            }

            resolve({
                pS: mainValve.pS,
                dT: mainValve.drainTime,
                dC: mainValve.drainCount,
                cB: (mainValve.cB) ? true : false
            })

        } catch (error) {
            console.log(error)
            reject('' + error);
        }
    });
}

/**
 * find valve from the system by mainValveId
 */
module.exports.findValveWithPowerStatusOn = (mainValveIds) => {
    return new Promise((resolve, reject) => {
        mainValveModel.findOne({ _id: { $in: mainValveIds }, pS: true })
            .populate('mainValves')
            .exec((err, valve) => {
                if (err) reject(err)

                else if (valve == null || valve == undefined) reject("No valve found");

                else resolve(valve);
            });
    })
};

/**
 * bulk update from the system by mainValveId
 */
module.exports.bulkUpdateMainValves = (valveIds, data) => {
    return new Promise((resolve, reject) => {
        mainValveModel.updateMany(
            { _id: { $in: valveIds } },
            data,
            { new: true },
            (err, valve) => {
                if (err) reject(err)
                else if (valve.nModified == 0) {
                    reject("Error updating pumps");
                } else {
                    resolve(valve);
                }
            });
    })
};

/**
 * find valve from the system by mainValveId
 */
module.exports.findByIdAndUpdate = (mainValveId, data) => {
    return new Promise((resolve, reject) => {
        mainValveModel.findByIdAndUpdate(mainValveId, data, { new: true })
            .exec((err, valve) => {
                if (err)
                    reject(err)
                else if (valve == null || valve == undefined)
                    reject("Invalid valveID");
                else
                    resolve(valve);
            });
    })
};

/**
 * find valve from the system by rack id and disable
 */
module.exports.disableMainValveFunction = (body) => {
    return new Promise((resolve, reject) => {
        mainValveModel.findOne({ rack: body.rackId })
            .exec(async (err, valve) => {
                if (err)
                    reject(err)
                else if (valve == null || valve == undefined)
                    reject("Invalid RackID");
                else {
                    try {
                        await pumpService.updateFunctionStatus(valve._id, body.status);
                        resolve("Rack functioning status updated");
                    } catch (error) {
                        reject("" + error);
                    }
                }
            });
    })
};