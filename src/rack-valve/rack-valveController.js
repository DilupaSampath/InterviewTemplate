const rackService = require('./rack-valveService');
const response = require('../../services/responseService');
const commonService = require('../../services/commonServices');
const socketService = require('../../services/socketService');
const eventService = require('../operations/operationEventService');

/**
 * get registered racks from the system
 * @param {*} req
 * @param {*} res
 */
module.exports.getRegisteredRacks = async (req, res) => {
    try {
        let racks = await rackService.getRackByStatus(true);
        response.successWithData(racks, res);
    } catch (error) {
        response.customError('' + error, res);
    }
};

/**
 * get unregistered racks from the system
 * @param {*} req
 * @param {*} res
 */
module.exports.getUnregisteredRacks = async (req, res) => {
    try {
        let racks = await rackService.getRackByStatus(false);
        response.successWithData(racks, res);
    } catch (error) {
        response.customError('' + error, res);
    }
};

/**
 * get unregistered racks from the system
 * @param {*} req
 * @param {*} res
 */
module.exports.getOrRegisterRack = async (req, res) => {
    try {
        let url = commonService.getUrlParameter('url', req);
        let deviceId = commonService.getUrlParameter('id', req);
        let valveNoFromUrl = commonService.getUrlParameter('valve', req);
        let racks = await rackService.registerOrReturnRack(url, deviceId, valveNoFromUrl);
        if (valveNoFromUrl != null && valveNoFromUrl != undefined && valveNoFromUrl != "") {
            socketService.rackDrainingTire({
                deviceId: deviceId,
                valve: valveNoFromUrl
            })
        }
        res.json(racks);
        // response.successWithData(racks, res);
    } catch (error) {
        response.customError('' + error, res);
    }
};

/**
 * register new rack to the system
 * @param {*} req
 * @param {*} res
 */
module.exports.registerRack = async (req, res) => {
    try {
        let racks = await rackService.createNewRack(req.body);
        response.successWithData(racks, res);
    } catch (error) {
        response.customError('' + error, res);
    }
};

/**
 * update rack from the database
 * @param {*} req
 * @param {*} res
 */
module.exports.updateRack = async (req, res) => {
    try {
        let rackDetails = JSON.parse(JSON.stringify(req.body));
        delete rackDetails.DeviceId;
        let rack = await rackService.findRackByDeviceIDAndUpdate(req.body.DeviceId, rackDetails);
        if (rack == null || rack == undefined) {
            response.customError("Invalid deviceId", res)
        } else {
            if (req.body.pS)
                eventService.rackOpenEvent(rack._id)
            response.successWithData(rack, res);
        }
    } catch (error) {
        response.customError('' + error, res);
    }
};

/**
 * get All racks
 * @param {*} req
 * @param {*} res
 */
module.exports.getAllRacks = async (req, res) => {
    try {
        let racks = await rackService.findRacks({});
        response.successWithData(racks, res);
    } catch (error) {
        response.customError('' + error, res);
    }
};

/**
 * get All racks
 * @param {*} req
 * @param {*} res
 */
module.exports.removeRack = async (req, res) => {
    try {
        let racks = await rackService.deleteRack(req.body.deviceId);
        response.successWithData(racks, res);
    } catch (error) {
        response.customError('' + error, res);
    }
};

/**
 * flush reset
 * @param {*} req
 * @param {*} res
 */
module.exports.flushReset = async (req, res) => {
    try {
        let racks = await rackService.flushReset(req.body.deviceId);
        response.successWithData(racks, res);
    } catch (error) {
        response.customError('' + error, res);
    }
};

/**
 * flush reset
 * @param {*} req
 * @param {*} res
 */
module.exports.findOne = async (req, res) => {
    try {
        let racks = await rackService.findRackByDeviceID(req.body.deviceId);
        response.successWithData(racks, res);
    } catch (error) {
        response.customError('' + error, res);
    }
};

/**
 * flush 
 * @param {*} req
 * @param {*} res
 */
module.exports.flush = async (req, res) => {
    try {
        let racks = await rackService.flush(req.body.deviceId);
        response.successWithData(racks, res);
    } catch (error) {
        response.customError('' + error, res);
    }
};