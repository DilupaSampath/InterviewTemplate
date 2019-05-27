// import token service
const tokenService = require('./tokenService');

module.exports = {
  badRequest(res) {
    return res.status(422).json({
      status: false,
      msg: 'Unexpected Error!',
    });
  },
  customError(message, res) {
    return res.status(422).json({
      status: false,
      msg: message,
    });
  },
  successWithData(data, res) {
    return res.json({
      status: true,
      data: data,
    });
  },
  successWithMessage(message, res) {
    return res.json({
      status: true,
      msg: message,
    });
  },
  successTokenWithData(data, res) {
    return res.json({
      status: true,
      data: data,
      token: tokenService.generateJWT(data.email)
    });
  },
};
