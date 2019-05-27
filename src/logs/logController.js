const logService = require('./logService');
const response = require('../../services/responseService');

/**
 * get operation logs
 */
module.exports.getOperationLogs = async (req, res) => {
    try {
        let logs = await logService.getLogs("Operation", req.body.limit)
        response.successWithData(logs, res);
    } catch (error) {
        response.customError('' + error, res);
    }
}

/**
 * get Main Valve logs
 */
module.exports.getMainValveLogs = async (req, res) => {
    try {
        let logs = await logService.getLogs("main-valve", req.body.limit)
        response.successWithData(logs, res);
    } catch (error) {
        response.customError('' + error, res);
    }
}

/**
 * get Rack logs
 */
module.exports.getrackLogs = async (req, res) => {
    try {
        let logs = await logService.getLogs("rack-valve", req.body.limit)
        response.successWithData(logs, res);
    } catch (error) {
        response.customError('' + error, res);
    }
}

/**
 * get Rack logs
 */
module.exports.getPumpLogs = async (req, res) => {
    try {
        let logs = await logService.getLogs("pump", req.body.limit)
        response.successWithData(logs, res);
    } catch (error) {
        response.customError('' + error, res);
    }
}

/**
 * get co2 logs
 */
module.exports.getCo2Logs = async (req, res) => {
    try {
        let logs = await logService.getLogs("co2-sensor", req.body.limit)
        response.successWithData(logs, res);
    } catch (error) {
        response.customError('' + error, res);
    }
}