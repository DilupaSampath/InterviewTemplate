// Import required libraries
const socket = require('socket.io');
const commonService = require('./commonServices');

// Define global variable
let io;

// Initialize the socket
function listen(app) {
    io = socket.listen(app);
    io.on('connect', socket => {
        console.log('user connected');
        serverTime();
        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
    });
    return io;
}

//broadcast data which added to the db
function emitAnnouncement(data) {
    io.emit('allAnnouncement', data);
}

//broadcast pump data
function emitPumpData(data) {
    io.emit('pumpStatus', data);
}

//broadcast main valve data
function emitMainValveData(data) {
    io.emit('mainValveStatus', data);
}

//broadcast rack data
function emitRackData(data) {
    io.emit('rackStatus', data);
}

function emitValveNo(data) {
    io.emit('refreshDashboard', data);
}

function mainValveCalibration(data) {
    io.emit('mainValveCalibration', data);
}

function rackDrainingTire(data) {
    io.emit('drainingTire', data);
}

function carbondioxideCurrentLevel(data) {
    io.emit('carbondioxideLevel', data);
}

function serverTime() {
    io.emit('serverTime', {
        dateTime: new Date(),
    });
}

//export functions
module.exports = {
    listen,
    emitMainValveData,
    emitPumpData,
    emitRackData,
    carbondioxideCurrentLevel,
    io,
    serverTime,
    emitAnnouncement,
    emitValveNo,
    mainValveCalibration,
    rackDrainingTire
};