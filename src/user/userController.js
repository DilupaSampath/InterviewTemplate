const userService = require('./userService');
const response = require('../../services/responseService');

/**
 * add new user to the system
 * @param {*} req
 * @param {*} res
 */
module.exports.newUser = async (req, res) => {
    try {
        let user = await userService.createUser(req.body);
        response.successTokenWithData(user, res);
    } catch (error) {
        response.customError('' + error, res);
    }
};

/**
 * user login to the system
 * @param {*} req
 * @param {*} res
 */
module.exports.login = async (req, res) => {
    try {
        let user = await userService.loginUser(req.body);
        response.successTokenWithData(user, res);
    } catch (error) {
        response.customError('' + error, res);
    }
};