const pumpService = require('./pumpService');
const commonService = require('../../services/commonServices');
const response = require('../../services/responseService');

/**
 * get all pumps
 */
module.exports.getAllPumps = async (req, res) => {
    try {
        let pumps = await pumpService.findPumps({})
        response.successWithData(pumps, res)
    } catch (error) {
        response.customError('' + error, res)
    }
}

/**
 * get unregistered pumps
 */
module.exports.getUnregisteredPumps = async (req, res) => {
    try {
        let pumps = await pumpService.findPumps({ status: false })
        response.successWithData(pumps, res)
    } catch (error) {
        response.customError('' + error, res)
    }
}

/**
 * get registered pumps
 */
module.exports.getRegisteredPumps = async (req, res) => {
    try {
        let pumps = await pumpService.findPumps({ status: true })
        response.successWithData(pumps, res)
    } catch (error) {
        response.customError('' + error, res)
    }
}

/**
 * get unregistered pump
 */
module.exports.findOnePump = async (req, res) => {
    try {
        let pumps = await pumpService.findPumpByPumpIDWithPopulate(req.body.pumpId)
        response.successWithData(pumps, res)
    } catch (error) {
        response.customError('' + error, res)
    }
}

/**
 * get power status or create pump 
 */
module.exports.getPowerStatusOrCreatePump = async (req, res) => {
    try {
        let url = commonService.getUrlParameter('url', req);
        let pumps = await pumpService.
            createOrGetPowerStatus(url, req.body.pumpId, req.body.status)
        res.json(pumps);
        // response.successWithData(pumps, res)
    } catch (error) {
        response.customError('' + error, res)
    }
}

/**
 * update pump from the database
 * @param {*} req
 * @param {*} res
 */
module.exports.updatePump = async (req, res) => {
    try {
        let pumpDetails = JSON.parse(JSON.stringify(req.body));
        delete pumpDetails.pumpId;
        let pump = await pumpService
            .findByPumpIdAndUpdate(req.body.pumpId, pumpDetails);
        (pump == null || pump == undefined) ?
            response.customError("Invalid pumpID", res) :
            response.successWithData(pump, res);
    } catch (error) {
        response.customError('' + error, res);
    }
};

/**
 * remove pump from the database
 * @param {*} req
 * @param {*} res
 */
module.exports.removePump = async (req, res) => {
    try {
        let pump = await pumpService.deletePump(req.body.pumpId)
        response.successWithData(pump, res);
    } catch (error) {
        response.customError('' + error, res);
    }
};

/**
 * update main valve functioning status
 * @param {*} req
 * @param {*} res
 */
module.exports.updateMainValveFunctioningStatus = async (req, res) => {
    try {
        let status = await pumpService.updateFunctionStatus(req.body.mainValveId, req.body.status);
        response.successWithData("Main valve functioning status updated.", res);
    } catch (error) {
        response.customError('' + error, res);
    }
};