const rackValveModel = require('./rack-valveModel');
const logService = require('../logs/logService');
const dateService = require('../../services/dateService');
const eventService = require('../operations/operationEventService');

/**
 * get unregistered racks
 * @param {*} status
 */
module.exports.getRackByStatus = (status) => {
    return new Promise((resolve, reject) => {
        rackValveModel.find({ status: status }, (err, tables) => {
            err ? reject(err) : resolve(tables);
        });
    })
};

/**
 * register new unregistered rack to the system 
 * or return existing rack data
 */
module.exports.registerOrReturnRack = (url, deviceId, valveNoFromUrl) => {
    return new Promise(async (resolve, reject) => {
        try {
            //create log
            await logService.createNewLog({
                data: { deviceId: deviceId, data: valveNoFromUrl },
                url: url,
                type: "rack-valve"
            })

            //update rack last updated time
            let updatedRack = await this.findRackByDeviceIDAndUpdateCron(
                deviceId,
                { lastRequestTime: new Date(dateService.getSriLankanDateTime()).getTime() });

            if (updatedRack == null || updatedRack == undefined) {
                //create new rack if not available
                await this.createNewRack({ DeviceId: deviceId });
                resolve("Rack successfully registered")

            } else {
                //call event listers
                if (valveNoFromUrl === 'c' || valveNoFromUrl === 'C') {
                    eventService.emitDataToListener(
                        updatedRack.DeviceId + 'rack-close',
                        updatedRack.DeviceId);
                    resolve({
                        dId: updatedRack.DeviceId,
                        dT: updatedRack.dT,
                        wT: updatedRack.wT,
                        pS: false,
                        status: updatedRack.status
                    });
                } else {
                    eventService.emitDataToListener(
                        updatedRack.DeviceId + 'rack-open',
                        updatedRack.DeviceId);
                    resolve({
                        dId: updatedRack.DeviceId,
                        dT: updatedRack.dT,
                        wT: updatedRack.wT,
                        pS: updatedRack.pS,
                        status: updatedRack.status
                    });
                }
            }
        } catch (error) {
            reject('' + error);
        }
    })
}

/**
 * find rack by device id
 */
module.exports.findRackByDeviceID = (deviceId) => {
    return new Promise((resolve, reject) => {
        rackValveModel.findOne({ DeviceId: deviceId }, (err, rack) => {
            err ? reject(err) : resolve(rack);
        });
    })
}

/**
 * find rack by device id
 */
module.exports.findByIdAndUpdate = (rackId, data) => {
    return new Promise((resolve, reject) => {
        rackValveModel.findByIdAndUpdate(
            rackId,
            data,
            { new: true },
            (err, rack) => {
                err ? reject(err) : resolve(rack);
            });
    })
}

/**
 * create new rack
 */
module.exports.createNewRack = (rackData) => {
    return new Promise(async (resolve, reject) => {
        let rack = new rackValveModel();
        if (Object.keys(rackData).length == 1)
            rack.DeviceId = rackData.DeviceId;
        else {
            rack.DeviceId = rackData.DeviceId;
            rack.wT = rackData.wT;
            rack.dT = rackData.dT;
            rack.Location = rackData.Location;
            rack.RackName = rackData.RackName;
            rack.LineNumber = rackData.LineNumber;
            rack.status = rackData.status;
            rack.channel = rackData.channel;
            rack.pS = rackData.pS;
        }
        try {
            //check rack availability
            let data = await this.findRackByDeviceID(rackData.DeviceId);
            if (data == null || data == undefined) {
                //create new rack
                rack.save((err, rack) => {
                    err ? reject(err) : resolve(rack);
                });
            } else {
                reject("Device already registered");
            }
        } catch (error) {
            reject("" + error);
        }
    })
}

/**
 * find rack by deviceID and update
 */
module.exports.findRackByDeviceIDAndUpdate = (deviceId, data) => {
    data.status = true;
    return new Promise((resolve, reject) => {
        rackValveModel.findOneAndUpdate({ DeviceId: deviceId },
            data,
            { new: true },
            (err, rack) => {
                err ? reject(err) : resolve(rack);
            });
    })
}

/**
 * find rack by deviceID and update
 */
module.exports.findRackByDeviceIDAndUpdateCron = (deviceId, data) => {
    return new Promise((resolve, reject) => {
        rackValveModel.findOneAndUpdate({ DeviceId: deviceId },
            data,
            { new: true },
            (err, rack) => {
                err ? reject(err) : resolve(rack);
            });
    })
}

/**
 * delete rack from the system
 */
module.exports.deleteRack = (deviceId) => {
    return new Promise((resolve, reject) => {
        rackValveModel.findOneAndDelete({ DeviceId: deviceId }, (err, rack) => {
            err ? reject(err) : resolve(rack);
        });
    })
};

/**
 * find rack from the system
 */
module.exports.findRacks = (condition) => {
    return new Promise((resolve, reject) => {
        rackValveModel.find(condition, (err, rack) => {
            err ? reject(err) : resolve(rack);
        });
    })
};

/**
 * flush reset Rack
 */
module.exports.flushReset = (deviceID) => {
    return new Promise(async (resolve, reject) => {
        try {
            //check rack availability
            let data = await this.findRackByDeviceID(deviceID);
            if (data != null || data != undefined) {
                let updatedRacks = await this.findRackByDeviceIDAndUpdate(deviceID, {
                    pS: false,
                    wT: data.oldWaitingTime,
                    dT: data.oldDrainingTime
                })
                eventService.emitDataToListener(deviceID + 'flush-reset', deviceID);
                resolve(updatedRacks);
            } else {
                reject("No device found");
            }
        } catch (error) {
            reject("" + error);
        }
    })
}

/**
 * flush rack
 */
module.exports.flush = (deviceID) => {
    return new Promise(async (resolve, reject) => {
        try {
            //check rack availability
            let data = await this.findRackByDeviceID(deviceID);
            if (data != null || data != undefined) {
                let updatedRacks = await this.findRackByDeviceIDAndUpdate(deviceID, {
                    pS: true,
                    wT: 0,
                    dT: 0,
                    oldWaitingTime: data.wT,
                    oldDrainingTime: data.dT
                })
                eventService.flushReseListner(deviceID);
                resolve(updatedRacks);
            } else {
                reject("No device found");
            }
        } catch (error) {
            console.log(error)
            reject("" + error);
        }
    })
}