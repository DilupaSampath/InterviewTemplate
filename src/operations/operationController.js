const operationService = require('./operationService');
const response = require('../../services/responseService');

/**
 * start sequence flow
 */
module.exports.start = async (req, res) => {
    try {   
        let status = await operationService.startSequence(req.body.pumpId);
        response.successWithData(status, res)
    } catch (error) {
        response.customError('' + error, res)
    }
}

/**
 * start calibration mode
 */
module.exports.enableCalibrationMode = async (req, res) => {
    try {
        let status = await operationService.startMainValveCalibrationMode(req.body.mainValveId);
        response.successWithData(status, res)
    } catch (error) {
        response.customError('' + error, res)
    }
}

/**
 * start calibration 
 */
module.exports.enableCalibration = async (req, res) => {
    try {
        let status = await operationService.startMainValveCalibration(req.body.mainValveId);
        response.successWithData(status, res)
    } catch (error) {
        response.customError('' + error, res)
    }
}

/**
 * pause calibration 
 */
module.exports.pauseCalibration = async (req, res) => {
    try {
        let status = await operationService.pauseMainValveCalibration(req.body.mainValveId);
        response.successWithData(status, res)
    } catch (error) {
        response.customError('' + error, res)
    }
}

/**
 * finish calibration 
 */
module.exports.finishCalibration = async (req, res) => {
    try {
        let status = await operationService.finishMainValveCalibrationMode(
            req.body.mainValveId,
            req.body.duration,
            req.body.value
        );
        response.successWithData(status, res)
    } catch (error) {
        response.customError('' + error, res)
    }
}

/**
 * finish calibration 
 */
module.exports.mainValveCalibration = async (req, res) => {
    console.log(req.body)
    try {
        let status = await operationService.mainValveCalibration(req.body)
        res.json(status);
        // response.successWithData(status, res)
    } catch (error) {
        response.customError('' + error, res)
    }
}