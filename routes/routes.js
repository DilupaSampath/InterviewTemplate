'use strict';
// Import Express
const express = require('express');
// user router
const router = express.Router();
// Import body parser
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json({ limit: '50mb' }));
router.use(bodyParser.json());

// import  controllers
const userController = require('../src/user/userController');
const rackController = require('../src/rack-valve/rack-valveController');
const valveController = require('../src/main-valve/mainValveController');
const pumpController = require('../src/pumps/pumpController');
const operationController = require('../src/operations/operationController');
const logController = require('../src/logs/logController');
const carbondioxideController = require('../src/carbondioxide/carbondioxideController');

// import validator Schemas
const userSchema = require('../src/user/userSchema');
const rackSchema = require('../src/rack-valve/rackValveSchema');
const valveSchema = require('../src/main-valve/mainValveSchema');
const pumpSchema = require('../src/pumps/pumpSchema');
const operationSchema = require('../src/operations/operationSchema');
const logSchema = require('../src/logs/logSchema');
const carbondioxideSchema = require('../src/carbondioxide/carbondioxideSchema');

// import Validator class
const validator = require('../services/validator');

//user routes
router.route('/user/new')
    .post(validator.validateBody(userSchema.newUser), userController.newUser);
router.route('/user/login')
    .post(validator.validateBody(userSchema.login), userController.login);

//Racks routes
router.route('/valve/get')
    .get(rackController.getOrRegisterRack);
router.route('/valves')
    .get(validator.validateHeader(), rackController.getAllRacks);
router.route('/valve/get/unregistered')
    .get(validator.validateHeader(), rackController.getUnregisteredRacks);
router.route('/valve/get/registered')
    .get(validator.validateHeader(), rackController.getRegisteredRacks);
router.route('/valve/update')
    .post(validator.validateBodyWithToken(rackSchema.updateRack),
        rackController.updateRack);
router.route('/valve/delete')
    .post(validator.validateBodyWithToken(rackSchema.deviceID),
        rackController.removeRack);
router.route('/valve/flush/reset')
    .post(validator.validateBodyWithToken(rackSchema.deviceID),
        rackController.flushReset);
router.route('/valve/flush')
    .post(validator.validateBodyWithToken(rackSchema.deviceID),
        rackController.flush);
router.route('/valve/findOne')
    .post(validator.validateBodyWithToken(rackSchema.deviceID),
        rackController.findOne);

//Valve routes
router.route('/main-valve/getAll')
    .get(validator.validateHeader(), valveController.getAllValves);
router.route('/main-valve')
    .post(validator.validateBody(valveSchema.mainValveStatus),
        valveController.getPowerStatusOrCreateValve);
router.route('/main-valve/update')
    .post(validator.validateBodyWithToken(valveSchema.updateValve),
        valveController.updateValve);
router.route('/main-valve/get/unregistered')
    .get(validator.validateHeader(), valveController.getUnregisteredValves);
router.route('/main-valve/get/registered')
    .get(validator.validateHeader(), valveController.getRegisteredValves);
router.route('/main-valve/delete')
    .post(validator.validateBodyWithToken(valveSchema.mainValveID),
        valveController.removeValve);
router.route('/main-valve/findOne')
    .post(validator.validateBodyWithToken(valveSchema.mainValveID),
        valveController.findOneValve);

//pump routes
router.route('/pumps')
    .get(validator.validateHeader(), pumpController.getAllPumps);
router.route('/pump/power-status')
    .post(validator.validateBody(pumpSchema.pumpStatus),
        pumpController.getPowerStatusOrCreatePump);
router.route('/pumps/unregistered')
    .get(validator.validateHeader(), pumpController.getUnregisteredPumps);
router.route('/pumps/registered')
    .get(validator.validateHeader(), pumpController.getRegisteredPumps);
router.route('/pump/update')
    .post(validator.validateBodyWithToken(pumpSchema.updatePump),
        pumpController.updatePump);
router.route('/pump/delete')
    .post(validator.validateBodyWithToken(pumpSchema.pumpId),
        pumpController.removePump);
router.route('/pump/findOne')
    .post(validator.validateBodyWithToken(pumpSchema.pumpId),
        pumpController.findOnePump);
router.route('/main-valve/updateFunction')
    .post(validator.validateBodyWithToken(pumpSchema.mainValeStatus),
        pumpController.updateMainValveFunctioningStatus);

//operation routes
router.route('/operation/start')
    .post(validator.validateBodyWithToken(operationSchema.pumpID),
        operationController.start);

router.route('/operation/valve/calibration')
    .post(validator.validateBodyWithToken(operationSchema.mainValveID),
        operationController.enableCalibrationMode);

router.route('/operation/valve/calibration/start')
    .post(validator.validateBodyWithToken(operationSchema.mainValveID),
        operationController.enableCalibration);

router.route('/operation/valve/calibration/pause')
    .post(validator.validateBodyWithToken(operationSchema.mainValveID),
        operationController.pauseCalibration);

router.route('/operation/valve/calibration/finish')
    .post(validator.validateBodyWithToken(operationSchema.finishCalibration),
        operationController.finishCalibration);

router.route('/operation/mainValve/flowSensor')
    .post(validator.validateBody(operationSchema.mainValveCalibration),
        operationController.mainValveCalibration);

//Log routes
router.route('/logs/operation')
    .post(validator.validateBody(logSchema.limit),
        logController.getOperationLogs);
router.route('/logs/mainValve')
    .post(validator.validateBody(logSchema.limit),
        logController.getMainValveLogs);
router.route('/logs/rackValve')
    .post(validator.validateBody(logSchema.limit),
        logController.getrackLogs);
router.route('/logs/pump')
    .post(validator.validateBody(logSchema.limit),
        logController.getPumpLogs);
router.route('/logs/co2')
    .post(validator.validateBody(logSchema.limit),
        logController.getCo2Logs);

//carbondioxide sensor routes
router.route('/co2/monitor')
    .post(validator.validateBody(carbondioxideSchema.deviceSchema),
        carbondioxideController.getDataOrRegisterDevice);
router.route('/co2/update')
    .post(validator.validateBodyWithToken(carbondioxideSchema.updateSensor),
        carbondioxideController.updateSensorSettings);
router.route('/co2/findOne')
    .post(validator.validateBodyWithToken(carbondioxideSchema.deviceId),
        carbondioxideController.findSensorByID);
router.route('/co2/remove')
    .post(validator.validateBodyWithToken(carbondioxideSchema.deviceId),
        carbondioxideController.remove);
router.route('/co2/getAll')
    .get(validator.validateHeader(),
        carbondioxideController.getAllSensors);

module.exports = router;