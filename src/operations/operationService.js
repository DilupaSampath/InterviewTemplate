const mainValveService = require('../main-valve/mainValveService');
const pumpService = require('../pumps/pumpService');
const eventService = require('./operationEventService');
const socketService = require('../../services/socketService');
const dateService = require('../../services/dateService');
const logService = require('../logs/logService');

module.exports.startSequence = (pumpID) => {
    return new Promise(async (resolve, reject) => {
        try {
            let pump = await pumpService.getAllPumpsWithSortedValves(pumpID);
            if (pump.seQuenceGap == null || pump.seQuenceGap == undefined) {
                await logService.createNewLog({
                    data: " Pump " + pump.pumpId + " sequence gap not found.",
                    type: "Operation"
                });
                reject("Sequence gap not found.");
            } else if (dateService.checkTimeLesser(pump.lasteStartedTime, pump.seQuenceGap) && (pump.lasteStartedTime == null || pump.lasteStartedTime == undefined)) {
                await pumpService.findByPumpIdAndUpdateCron(
                    pump.pumpId,
                    { lasteStartedTime: dateService.getSriLankanDateTime() }
                );
                for (mainValve of pump.mainValves) {
                    if (mainValve.status != false) {
                        eventService.mainValveOpenEvent(pump.pumpId, mainValve.valveID);
                        break;
                    }
                }
                await logService.createNewLog({
                    data: " Pump " + pump.pumpId + " sequence started.",
                    type: "Operation"
                });
                resolve(pump);
            } else {
                await logService.createNewLog({
                    data: " Pump " + pump.pumpId + " process already running ",
                    type: "Operation"
                });
                reject("Process already running");
            }
        } catch (error) {
            reject('' + error);
        }
    })
}

/**
 * start calibration turn off all the main valves that connected to the pump
 * turn on required main valve and enable calibration mode
 */
module.exports.startMainValveCalibrationMode = async (mainValveId) => {
    return new Promise(async (resolve, reject) => {
        try {

            //get the required pump details with main valve details
            let pump = await pumpService.getPumpNextMainValveToOpen(mainValveId);

            //get main valveIds to power off
            let valves = [];
            pump[0].mainValves.forEach(valve => {
                valves.push(valve.valveID);
            });

            //power off all the main valves
            await mainValveService.bulkUpdateMainValves(valves, { pS: false });

            //power on main valve and activate calibration mode
            let mainValve = await mainValveService.findByIdAndUpdate(
                mainValveId,
                { pS: true, cB: true });

            resolve("Calibration mode activated for " + mainValve.mainValveId);
        } catch (error) {
            reject('' + error);
        }
    })
}

/**
 * turn on pump for calibration
 */
module.exports.startMainValveCalibration = async (mainValveId) => {
    return new Promise(async (resolve, reject) => {
        try {
            //get the required pump details with main valve details
            let pump = await pumpService.getPumpNextMainValveToOpen(mainValveId);

            //turn on the pump
            await pumpService.findByPumpIdAndUpdate(pump[0].pumpId, { pS: true });

            resolve("Calibration started");
        } catch (error) {
            reject('' + error);
        }
    })
}

/**
 * turn off pump when calibration pause
 */
module.exports.pauseMainValveCalibration = async (mainValveId) => {
    return new Promise(async (resolve, reject) => {
        try {
            //get the required pump details with main valve details
            let pump = await pumpService.getPumpNextMainValveToOpen(mainValveId);

            //turn off the pump
            await pumpService.findByPumpIdAndUpdate(pump[0].pumpId, { pS: false });

            resolve("Calibration pause");
        } catch (error) {
            reject('' + error);
        }
    })
}

/**
 * Turn off the pump 
 * Turn off calibration mode and power status of the valve
 */
module.exports.finishMainValveCalibrationMode = async (mainValveId, duration, count) => {
    return new Promise(async (resolve, reject) => {
        try {

            //get the required pump details with main valve details
            let pump = await pumpService.getPumpNextMainValveToOpen(mainValveId);

            //turn off the pump
            await pumpService.findByPumpIdAndUpdate(pump[0].pumpId, { pS: false });

            //power ff main valve and deactivate calibration mode
            let mainValve = await mainValveService.findByIdAndUpdate(
                mainValveId,
                {
                    pS: false,
                    drainTime: duration,
                    drainCount: count,
                    cB: false
                });

            //turn off the pump
            await pumpService.updateValveDrainTime(mainValveId, duration);

            resolve("Calibration mode deactivated for " + mainValve.mainValveId);
        } catch (error) {
            reject('' + error);
        }
    })
}

/**
 * send flow sensor data to the socket
 */
module.exports.mainValveCalibration = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let mainValve = await mainValveService.findOneValve(data.mainValveId)
            if (mainValve == null || mainValve == undefined) {
                reject("Invalid main valve")
            } else {
                socketService.mainValveCalibration(data);
                resolve({ cB: mainValve.cB })
            }
        } catch (error) {
            reject('' + error);
        }
    })
}