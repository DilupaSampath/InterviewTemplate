const carbondioxideService = require('./carbondioxideService');
const commonService = require('../../services/commonServices');
const response = require('../../services/responseService');

/**
 * update carbondioxide sensor settings
 */
module.exports.updateSensorSettings = async (req, res) => {
    try {
        let obj = JSON.parse(JSON.stringify(req.body))
        delete obj.deviceId;
        obj.status = true;
        let sensor = await carbondioxideService.updateDeviceByID(req.body.deviceId, obj)
        response.successWithData(sensor, res)
    } catch (error) {
        response.customError('' + error, res)
    }
}

/**
 * get all carbondioxide sensors
 */
module.exports.getAllSensors = async (req, res) => {
    try {
        let sensors = await carbondioxideService.findMany({})
        response.successWithData(sensors, res)
    } catch (error) {
        response.customError('' + error, res)
    }
}

/**
 * get sonsor by sensorID
 */
module.exports.findSensorByID = async (req, res) => {
    try {
        let result = await carbondioxideService.findOneById(req.body.deviceId)
        response.successWithData(result, res)
    } catch (error) {
        response.customError('' + error, res)
    }
}

/**
 * get sonsor by sensorID
 */
module.exports.getDataOrRegisterDevice = async (req, res) => {
    try {
        let url = commonService.getUrlParameter('url', req);
        let sensor = await carbondioxideService
            .getDataOrRegisterDevice(url, req.body.did, req.body)
        res.json(sensor);
    } catch (error) {
        response.customError('' + error, res)
    }
}

/**
 * delete carbondioxide sensor
 */
module.exports.remove = async (req, res) => {
    try {
        await carbondioxideService.deleteSensor(req.body.deviceId)
        response.successWithData("Device successfully deleted.", res)
    } catch (error) {
        response.customError('' + error, res)
    }
}