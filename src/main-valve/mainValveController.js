const mainValveService = require('./mainValveService');
const commonService = require('../../services/commonServices');
const response = require('../../services/responseService');

/**
 * get all valves
 */
module.exports.getAllValves = async (req, res) => {
    try {
        let valves = await mainValveService.getAll({})
        response.successWithData(valves, res)
    } catch (error) {
        response.customError('' + error, res)
    }
}

/**
 * get unregistered valves
 */
module.exports.getUnregisteredValves = async (req, res) => {
    try {
        let valves = await mainValveService.findValves({ status: false })
        response.successWithData(valves, res)
    } catch (error) {
        response.customError('' + error, res)
    }
}

/**
 * get unregistered valves
 */
module.exports.getRegisteredValves = async (req, res) => {
    try {
        let valves = await mainValveService.findValves({ status: true })
        response.successWithData(valves, res)
    } catch (error) {
        response.customError('' + error, res)
    }
}

/**
 * get unregistered valves
 */
module.exports.findOneValve = async (req, res) => {
    try {
        let valves = await mainValveService.findOneValve(req.body.mainValveId)
        response.successWithData(valves, res)
    } catch (error) {
        response.customError('' + error, res)
    }
}

/**
 * get power status or create valve 
 */
module.exports.getPowerStatusOrCreateValve = async (req, res) => {
    try {
        let url = commonService.getUrlParameter('url', req);
        let valves = await mainValveService.
            createOrGetPowerStatus(url, req.body.mainValveId, req.body.status)
        res.json(valves);
        // response.successWithData(valves, res)
    } catch (error) {
        response.customError('' + error, res)
    }
}

/**
 * update valve from the database
 * @param {*} req
 * @param {*} res
 */
module.exports.updateValve = async (req, res) => {
    try {
        let valveDetails = JSON.parse(JSON.stringify(req.body));
        delete valveDetails.mainValveId;
        let valve = await mainValveService
            .findValveByDeviceIDAndUpdate(req.body.mainValveId, valveDetails);
        if (valve == null || valve == undefined)
            response.customError("Invalid deviceId", res)
        else
            response.successWithData(valve, res);
    } catch (error) {
        response.customError('' + error, res);
    }
};

/**
 * remove registered valve
 * @param {*} req
 * @param {*} res
 */
module.exports.removeValve = async (req, res) => {
    try {
        let racks = await mainValveService.deleteValves(req.body.mainValveId);
        response.successWithData(racks, res);
    } catch (error) {
        response.customError('' + error, res);
    }
};
