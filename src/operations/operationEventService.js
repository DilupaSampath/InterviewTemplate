const ee = require('event-emitter');
const timeout = require('../../config/config').setListenerTimeout;
const flushTImeout = require('../../config/config').setFlushTimeout;
const config = require('../../config/config');
const mainValveService = require('../main-valve/mainValveService');
const commonService = require('../../services/commonServices');
const rackService = require('../rack-valve/rack-valveService');
const pumpService = require('../pumps/pumpService');
const logService = require('../logs/logService');

let emitter = new ee();

/**
 * power on main valve and start main valve lister to get the confirmation
 */
module.exports.mainValveOpenEvent = async (pumpId, mainValveId) => {
    try {
        //turn on main valve
        let mainValve = await mainValveService.findByIdAndUpdate(mainValveId, { pS: true });

        console.log("Main valve " + mainValve.mainValveId + " open event listener created");

        //set main valve time out if any error on the valve then time out the listener
        var timer = setTimeout(async () => {

            //remove created listener
            removeListener(mainValve.mainValveId + 'main-valve-open');

            //update main valve power status to false
            await mainValveService.findByIdAndUpdate(mainValveId, { pS: false });

            //create log
            await logService.createNewLog({
                data: " Main Valve " + mainValve.mainValveId + " not opened please check",
                type: "Operation"
            })

            console.log('Send main valve open time out SMS');

        }, timeout);

        //create listener for main valve open event
        emitter.once(mainValve.mainValveId + 'main-valve-open', listener = async (mainValve) => {

            //remove created listener
            removeListener(mainValve + 'main-valve-open');

            //create log
            await logService.createNewLog({
                data: "Main valve " + mainValve + " successfully opened",
                type: "Operation"
            })

            //remove timer if available
            if (timer) {
                clearTimeout(timer);
                timer = 0;
            }
            console.log("Main valve successfully opened");

            //turn on the pump after main valve open confirmation
            this.pumpOpenEvent(pumpId)
        });

    } catch (error) {

        //create log
        await logService.createNewLog({
            data: "Main Valve not opened" + error,
            type: "Operation"
        })
        console.log(error)
    }
}

/**
 * create pump open event
 */
module.exports.pumpOpenEvent = async (pumpId) => {
    try {
        console.log("pump " + pumpId + " open event listener created");
        //turn on pump
        let pump = await pumpService.findByPumpIdAndUpdate(pumpId, { pS: true });

        let mainValves = [];
        pump.mainValves.forEach(valve => {
            mainValves.push(valve.valveID);
        });
        //get power on valve
        let mainValve = await mainValveService.findValveWithPowerStatusOn(mainValves);

        //get main valve details from pump
        let mainValveDetails = await pumpService.getMainValveDetails(mainValve._id);

        //set pump open listener timeout (duration - 10seconds)
        let pumpOpenTimeOut = commonService
            .convertSecondToMilliseconds(
                (+mainValveDetails[0].mainValves[0].duration - 10).toFixed(0));

        //set pump time out if any error on the pump then time out the listener
        var timer = setTimeout(async () => {

            //remove created listener
            removeListener(pumpId + 'pump-open');

            //turn off pump power status
            await pumpService.findByPumpIdAndUpdate(pumpId, { pS: false });

            //create log
            await logService.createNewLog({
                data: "pump  " + pumpId + " not opened please check",
                type: "Operation"
            })

            console.log('Send pump open time out SMS');

        }, pumpOpenTimeOut);

        //create listener for pump open confirmation
        emitter.once(pumpId + 'pump-open', listener = async (pumpId) => {

            //remove timer if available
            if (timer) {
                clearTimeout(timer);
                timer = 0;
            }

            //remove created listener
            removeListener(pumpId + 'pump-open');

            //turn off pump power status
            await pumpService.findByPumpIdAndUpdate(pumpId, { pS: false });

            //create log
            await logService.createNewLog({
                data: "Pump " + pumpId + " successfully opened",
                type: "Operation"
            })

            console.log("Pump successfully opened")

            //create pump close event after pump open confirmation
            this.pumpCloseEvent(pumpId)
        });
    } catch (error) {

        //create log
        await logService.createNewLog({
            data: "Pump not opened " + error,
            type: "Operation"
        })
        console.log(error)
    }
}

/**
 * pump close event
 */
module.exports.pumpCloseEvent = async (pumpId) => {
    try {
        console.log("pump " + pumpId + " close event listener created");

        //get pump details
        let pump = await pumpService.findPumpByPumpID(pumpId)

        let mainValves = [];
        pump.mainValves.forEach(valve => {
            mainValves.push(valve.valveID);
        });

        //get power on valve
        let mainValve = await mainValveService.findValveWithPowerStatusOn(mainValves);

        //get main valve details from pump
        let mainValveDetails = await pumpService.getMainValveDetails(mainValve._id);

        //set pump open listener timeout (duration - 10seconds)
        let pumpOpenTimeOut = commonService
            .convertSecondToMilliseconds(
                (+mainValveDetails[0].mainValves[0].duration + 100).toFixed(0));

        //set pump time out if any error on the pump then time out the listener
        var timer = setTimeout(async () => {

            //remove created listener
            removeListener(pumpId + 'pump-close');

            //create log
            await logService.createNewLog({
                data: "pump  " + pumpId + " not closed please check",
                type: "Operation"
            })

            console.log('Send pump close time out SMS');

        }, pumpOpenTimeOut);

        //create listener for pump close confirmation
        emitter.once(pumpId + 'pump-close', listener = async (pumpId) => {

            //remove timer if available
            if (timer) {
                clearTimeout(timer);
                timer = 0;
            }

            //remove created listener
            removeListener(pumpId + 'pump-open');

            //create log
            await logService.createNewLog({
                data: "Pump " + pumpId + " successfully opened",
                type: "Operation"
            })

            console.log("Pump successfully closed")
            let mainValves = [];
            pump.mainValves.forEach(valve => {
                mainValves.push(valve.valveID);
            });
            let mainValve = await mainValveService.findValveWithPowerStatusOn(mainValves);

            //create main valve close event after pump close confirmation
            this.mainValveCloseEvent(mainValve._id);
        });
    } catch (error) {

        //create log
        await logService.createNewLog({
            data: "Pump not opened " + error,
            type: "Operation"
        });
        console.log(error)
    }
}

/**
 * main valve close listener
 */
module.exports.mainValveCloseEvent = async (mainValveId) => {
    try {
        //turn off main valve
        let mainValve = await mainValveService.findByIdAndUpdate(mainValveId, { pS: true });

        console.log("Main valve " + mainValve.mainValveId + " close event listener created");

        if (mainValve.drainTime) {
            timeout = commonService.convertSecondToMilliseconds(mainValve.drainTime)
        }

        //set main valve time out if any error on the valve then time out the listener
        var timer = setTimeout(async () => {

            //remove created listener
            removeListener(mainValve.mainValveId + 'main-valve-close');

            //update main valve power status to false
            await mainValveService.findByIdAndUpdate(mainValveId, { pS: false });

            //create log
            await logService.createNewLog({
                data: " Main Valve " + mainValve.mainValveId + " not Closed please check",
                type: "Operation"
            })

            console.log('Send main valve close time out SMS');

        }, timeout);

        //create listener for main valve close event
        emitter.once(mainValve.mainValveId + 'main-valve-close', listener = async (mainValve) => {

            //remove created listener
            removeListener(mainValve + 'main-valve-close');

            //update main valve power status to false
            let mainValveData = await mainValveService
                .findValveByDeviceIDAndUpdate(mainValve, { pS: false });

            //create log
            await logService.createNewLog({
                data: "Main valve " + mainValve + " successfully closed",
                type: "Operation"
            })

            //remove timer if available
            if (timer) {
                clearTimeout(timer);
                timer = 0;
            }
            console.log("Main valve successfully closed");

            //turn on the rack after main valve close confirmation
            this.rackOpenEvent(mainValveData.rack)

            //check next main valve to turn on 
            let mainValves = await pumpService.getPumpNextMainValveToOpen(mainValveData._id);
            var mainValveID;
            //find next main valve from the main valve list
            for (let index = 0; index < mainValves[0].mainValves.length; index++) {
                if (mainValves[0].mainValves[index].valveID.equals(mainValveData._id) &&
                    mainValves[0].mainValves.length > index + 1) {
                    let isFound = false;
                    //check get next functioning main valve to open
                    for (let i = index + 1; i < mainValves[0].mainValves.length; i++) {
                        if (mainValves[0].mainValves[i].status != false) {
                            mainValveID = mainValves[0].mainValves[i].valveID
                            isFound = true;
                            break;
                        }
                    }
                    if (isFound == true) {
                        break;
                    }
                }
            }
            //if next main valve available then do the process again
            if (mainValveID != null || mainValveID != undefined) {
                this.mainValveOpenEvent(mainValves[0].pumpId, mainValveID)
            } else {
                console.log("No main valves to open")
            }
        });

    } catch (error) {

        //create log
        await logService.createNewLog({
            data: "Main Valve not opened " + error,
            type: "Operation"
        })
        console.log(error)
    }
}

module.exports.rackOpenEvent = async (rackId) => {
    try {
        //turn on rack
        let rackDetails = await rackService.findByIdAndUpdate(rackId, { pS: true });

        console.log("Rack " + rackDetails.DeviceId + " open event listener created");

        //set rack time out if any error on the rack then time out the listener
        var timer = setTimeout(async () => {

            //remove created listener
            removeListener(rackDetails.DeviceId + 'rack-open');

            //update rack power status to false
            await rackService.findByIdAndUpdate(rackId, { pS: false });

            //create log
            await logService.createNewLog({
                data: " Rack " + rackDetails.DeviceId + " not opened please check",
                type: "Operation"
            })

            console.log('Send rack open time out SMS');

        }, timeout);

        //create listener for confirm rack open event
        emitter.once(rackDetails.DeviceId + 'rack-open', listener = async (rackId) => {

            //remove created listener
            removeListener(rackId + 'rack-open');

            //create log
            await logService.createNewLog({
                data: "Rack " + rackId + " successfully opened",
                type: "Operation"
            })

            //remove timer if available
            if (timer) {
                clearTimeout(timer);
                timer = 0;
            }
            console.log("Rack successfully opened");

            //turn off the rack after rack open confirmation
            this.rackCloseEvent(rackId);
        });

    } catch (error) {

        //create log
        await logService.createNewLog({
            data: "Rack not opened " + error,
            type: "Operation"
        })
        console.log(error)
    }
}

/**
 * rack close event
 */
module.exports.rackCloseEvent = async (rackId) => {
    try {
        console.log("Rack " + rackId + " close event listener created");
        let rackDetails = await rackService.findRackByDeviceID(rackId);
        let time = ((+rackDetails.wT + +rackDetails.dT) * 9).toFixed(0)

        //set rack time out if any error on the rack then time out the listener
        var timer = setTimeout(async () => {

            //remove created listener
            removeListener(rackId + 'rack-close');

            //update rack power status to false
            await rackService.findRackByDeviceIDAndUpdate(rackId, { pS: false });

            //create log
            await logService.createNewLog({
                data: " Rack " + rackId + " not closed please check",
                type: "Operation"
            })

            console.log('Send rack close time out SMS');

        }, time);

        //create listener for confirm rack close event
        emitter.once(rackId + 'rack-close', listener = async (rackId) => {

            //remove created listener
            removeListener(rackId + 'rack-close');

            //update rack power status to false
            await rackService.findRackByDeviceIDAndUpdate(rackId, { pS: false });

            //create log
            await logService.createNewLog({
                data: "Rack " + rackId + " successfully closed",
                type: "Operation"
            })

            //remove timer if available
            if (timer) {
                clearTimeout(timer);
                timer = 0;
            }

            console.log("Rack successfully closed");
        });

    } catch (error) {

        await rackService.findRackByDeviceIDAndUpdate(rackId, { pS: false });
        //create log
        await logService.createNewLog({
            data: "Rack not closed " + error,
            type: "Operation"
        })
        console.log(error)
    }
}

/**
 * remove created listeners from the system
 * @param {*} listenerName 
 */
function removeListener(listenerName) {
    emitter.off(listenerName, listener);
}

/**
 * emit data to the emitter 
 */
module.exports.emitDataToListener = (listenerName, data) => {
    emitter.emit(listenerName, data)
}


/**
 * flush reset listner
 */
module.exports.flushReseListner = async (rackId) => {
    try {

        await logService.createNewLog({
            data: " Rack " + rackId + " flush started.",
            type: "Operation"
        })

        console.log("Rack " + rackId + " flush started");

        //set rack time out if any error on the rack then time out the listener
        var timer = setTimeout(async () => {

            //remove created listener
            removeListener(rackId + 'flush-reset');

            //flush reset
            await rackService.flushReset(rackId);

            //create log
            await logService.createNewLog({
                data: " Rack " + rackId + " auto flush reset after 30 minutes",
                type: "Operation"
            })

            console.log("Rack " + rackId + " auto flush reset after 30 minutes");

        }, flushTImeout);

        //create listener for flush reset event
        emitter.once(rackId + 'flush-reset', listener = async (rackId) => {

            //remove created listener
            removeListener(rackId + 'flush-reset');

            //create log
            await logService.createNewLog({
                data: "Rack " + rackId + " flush reset by the user",
                type: "Operation"
            })

            //remove timer if available
            if (timer) {
                clearTimeout(timer);
                timer = 0;
            }

            console.log("Rack " + rackId + " flush reset by the user");
        });

    } catch (error) {

        await rackService.flushReset(rackId);
        //create log
        await logService.createNewLog({
            data: "Rack flush reset error :" + error,
            type: "Operation"
        })
        console.log(error)
    }
}