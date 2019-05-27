const commonService = require('./commonServices');
/**
 * Convert any datetime to sri lankan datetime
 * @returns {Date}
 */
module.exports.getSriLankanDateTime = () => {
    // Create Date object for current location
    const d = new Date();

    // Convert to milliseconds since Jan 1 1970
    const localTime = d.getTime();

    // Obtain local UTC offset and convert to msec
    const localOffset = d.getTimezoneOffset() * 60000;

    // Obtain UTC time in msec
    const utc = localTime + localOffset;

    // obtain and add destination's UTC time offset which is UTC + 5.5 hours
    const offset = 5.5;
    const sriLanka = utc + (3600000 * offset);

    // convert msec value to date
    const sriLankanDate = new Date(sriLanka);

    return sriLankanDate;
};

/**
 * get current time in HH:MM format
 */
module.exports.startTime = () => {
    var today = new Date(this.getSriLankanDateTime()),
        h = checkTime(today.getHours()),
        m = checkTime(today.getMinutes())
    return h + ":" + m;
}

function checkTime(i) {
    return (i < 10) ? "0" + i : i;
}

//check given datetime time lesser than given seconds
module.exports.checkTimeLesser = (date, seconds) => {
    let previceTime =
        new Date(this.getSriLankanDateTime() - commonService.convertSecondToMilliseconds(seconds));
    return (date < previceTime)
}