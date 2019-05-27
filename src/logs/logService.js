const logModel = require('./logModel');
const dateService = require('../../services/dateService');
const socketService = require('../../services/socketService');

/**
 * create new log
 */
module.exports.createNewLog = (logData) => {
    //broadcast operation data
    if (logData.type == "Operation") {
        socketService.emitAnnouncement(logData);
    }
    return new Promise((resolve, reject) => {
        const log = new logModel();
        log.log = logData.data;
        log.type = logData.type;
        log.url = logData.url;
        log.createdAt = new Date(dateService.getSriLankanDateTime());
        log.save(function (err, data) {
            (err) ? reject(err) : resolve(data)
        })
    })
}

/**
 * get logs
 */
module.exports.getLogs = (type, limit) => {
    return new Promise((resolve, reject) => {
        logModel.find({ type: type })
            .sort({ updatedAt: -1 })
            .limit(Number(limit))
            .exec((error, data) => {
                if (error)
                    reject(error)
                else if (data == null || data == undefined || data.length == 0)
                    reject("No logs found");
                else
                    resolve(data);
            })
    })
}