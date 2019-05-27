module.exports.getUrlParameter = (name, req) => {
    let requestUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    let urlArray;
    const count = (requestUrl.match(/http/g) || []).length;
    if (count > 1) {
        urlArray = requestUrl.split(req.protocol + '://' + req.hostname);
        requestUrl = req.protocol + '://' + req.hostname + urlArray[2];
    }
    if (!requestUrl)
        requestUrl = window.location.href;
    else if (name == "url")
        return requestUrl
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(requestUrl);
    if (!results)
        return null;
    else if (!results[2])
        return '';
    else
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

/**
 * async await for setTimeout
 */
module.exports.sleep = (time) => {
    return new Promise(resolve => {
        setTimeout(resolve, time)
    })
}

/**
 * convert seconds to milliseconds
 */
module.exports.convertSecondToMilliseconds = (seconds) => {
    return (+seconds * 1000).toFixed(0);
}


