const pumpService = require('../src/pumps/pumpService');
const rackService = require('../src/rack-valve/rack-valveService');
const mainValveService = require('../src/main-valve/mainValveService');
const dateService = require('./dateService');
const CronJob = require('cron').CronJob;
const socketService = require('./socketService');

//pump cron service
function runCheckPumpStatusCron() {
    new CronJob('*/20 * * * * *', async () => {
        //get all registered pumps
        let pumps = await pumpService.findPumps({});

        for (pump of pumps) {
            let lastRequestTime = pump.lastRequestTime;
            const currentTimeInMilliseconds =
                new Date(dateService.getSriLankanDateTime()).getTime();
            const timeDifference = currentTimeInMilliseconds - parseInt(lastRequestTime);

            if (timeDifference < 20000) {
                let pumpDetails = await pumpService
                    .findByPumpIdAndUpdateCron(pump.pumpId, { active: true });
                if (pumpDetails == null || pumpDetails == undefined) {
                    console.log("Invalid device id")
                }
                socketService.emitPumpData({
                    data: pumps
                });

            } else {
                let pumpDetails = await pumpService
                    .findByPumpIdAndUpdateCron(pump.pumpId, { active: false });
                if (pumpDetails == null || pumpDetails == undefined) {
                    console.log("Invalid device id")
                }
                socketService.emitPumpData({
                    data: pumps
                });
            }
        }
    }, null, true, '');
}

//main valve cron service
function runCheckMainValvesStatusCron() {
    new CronJob('*/20 * * * * *', async () => {

        //get all registered main valves
        let mainValves = await mainValveService.findValves({});

        for (mainValve of mainValves) {
            let lastRequestTime = mainValve.lastRequestTime;
            const currentTimeInMilliseconds =
                new Date(dateService.getSriLankanDateTime()).getTime();
            const timeDifference = currentTimeInMilliseconds - parseInt(lastRequestTime);

            if (timeDifference < 20000) {
                let mainValveDetails = await mainValveService
                    .findValveByDeviceIDAndUpdateCron(mainValve.mainValveId, { active: true });
                if (mainValveDetails == null || mainValveDetails == undefined) {
                    console.log("Invalid device id")
                }
                socketService.emitMainValveData({
                    data: mainValves
                });
            } else {
                let mainValveDetails = await mainValveService
                    .findValveByDeviceIDAndUpdateCron(mainValve.mainValveId, { active: false });
                if (mainValveDetails == null || mainValveDetails == undefined) {
                    console.log("Invalid device id")
                }
                socketService.emitMainValveData({
                    data: mainValves
                });
            }
        }
    }, null, true, '');
}

//rack cron service
function runCheckRacksStatusCron() {
    new CronJob('*/20 * * * * *', async () => {

        //get all registered racks
        let racks = await rackService.findRacks({});

        for (rack of racks) {
            let lastRequestTime = rack.lastRequestTime;
            const currentTimeInMilliseconds =
                new Date(dateService.getSriLankanDateTime()).getTime();
            const timeDifference = currentTimeInMilliseconds - parseInt(lastRequestTime);

            if (timeDifference < 20000) {
                let rackDetail = await rackService
                    .findRackByDeviceIDAndUpdateCron(rack.DeviceId, { active: true });
                if (rackDetail == null || rackDetail == undefined) {
                    console.log("Invalid device id")
                }
                socketService.emitRackData({
                    data: racks
                });
            } else {
                let rackDetail = await rackService
                    .findRackByDeviceIDAndUpdateCron(rack.DeviceId, { active: false });
                if (rackDetail == null || rackDetail == undefined) {
                    console.log("Invalid device id")
                }
                socketService.emitRackData({
                    data: racks
                });
            }
        }
    }, null, true, '');
}

//Run Server Time Cron cron service
function runServerTimeCron() {
    new CronJob('* * * * * *', async () => {
        socketService.serverTime();
    }, null, true, '')
}
//export functions
module.exports = {
    runCheckPumpStatusCron,
    runCheckMainValvesStatusCron,
    runServerTimeCron,
    runCheckRacksStatusCron
};