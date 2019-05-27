const carbonModel = require('./carbondioxideModel');
const logService = require('../logs/logService');
const dateService = require('../../services/dateService');
const socketService = require('../../services/socketService');

/**
 * save devices
 */
module.exports.saveDevice = (deviceId) => {
    return new Promise((resolve, reject) => {
        const carbon = new carbonModel();
        carbon.deviceId = deviceId;
        carbon.save(function (err, data) {
            (err) ? reject(err) : resolve(data)
        })
    })
}

/**
 * get data from device and do the tasks
 */
module.exports.getDataOrRegisterDevice = async (url, deviceId, body) => {
    return new Promise(async (resolve, reject) => {
        try {
            socketService.carbondioxideCurrentLevel({ currenctLevel: body.cL });
            //create log
            await logService.createNewLog({
                data: { deviceId: deviceId, data: body },
                url: url,
                type: "co2-sensor"
            })

            let device = await this.findOneByDeviceID(deviceId);
            if (device == null || device == undefined) {

                //register device if not found
                await this.saveDevice(deviceId);

                resolve("Device Registered");
            } else {

                //get current time
                const currentTimeInMilliseconds =
                    new Date(dateService.getSriLankanDateTime()).getTime();

                //update last request time , status and current level
                let deviceupdated = await this.updateDeviceByID(
                    device._id,
                    {
                        pS: body.pS,
                        testMode: body.tM,
                        currentGas: body.cL,
                        lastUpdatedTime: currentTimeInMilliseconds
                    })

                //create responce object
                resolve({
                    pS: device.pS,
                    tM: device.testMode,
                    mL: device.minimumLimit,
                    nS: device.noOfCylinders,
                })
            }
        } catch (error) {
            reject('' + error)
        }
    })
}

/**
 * find device by device id
 */
module.exports.findOneByDeviceID = (deviceId) => {
    return new Promise((resolve, reject) => {
        carbonModel.findOne({ deviceId: deviceId })
            .exec((err, data) => {
                (err) ? reject(err) : resolve(data)
            })
    })
}

/**
 * find device by device id
 */
module.exports.updateDeviceByID = (objectID, data) => {
    return new Promise((resolve, reject) => {
        carbonModel.findByIdAndUpdate(objectID, data, { new: true, safe: true })
            .exec((err, data) => {
                if (err)
                    reject(err);
                else if (data == null || data == undefined)
                    reject("Invalid ID");
                else
                    resolve(data);
            })
    })
}

/**
 * find device by device id
 */
module.exports.findOneById = (objectID) => {
    return new Promise((resolve, reject) => {
        carbonModel.findById(objectID)
            .exec((err, data) => {
                if (err)
                    reject(err);
                else if (data == null || data == undefined)
                    reject("Invalid ID");
                else
                    resolve(data);
            })
    })
}

/**
 * get carbondioxide sensors
 */
module.exports.findMany = async (parameter) => {
    return new Promise((resolve, reject) => {
        carbonModel.find(parameter)
            .exec((err, data) => {
                if (err)
                    reject(err);
                else if (data == null || data == undefined, data.length == 0)
                    reject("No sensors found");
                else
                    resolve(data);
            })
    })
}

/**
 * delete carbondioxide sensor
 */
module.exports.deleteSensor = async (deviceId) => {
    return new Promise((resolve, reject) => {
        carbonModel.findByIdAndDelete(deviceId)
            .exec((err, data) => {
                if (err)
                    reject(err);
                else if (data == null || data == undefined)
                    reject("No sensors found");
                else
                    resolve(data);
            })
    })
}