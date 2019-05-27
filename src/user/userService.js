const userModel = require('./userModel');

/**
 * create new user
 * @param {*} body 
 */
module.exports.createUser = (body) => {
    return new Promise((resolve, reject) => {
        userModel.findOne({ email: body.email }, function (err, userData) {
            if (err) {
                reject(err);
            }
            else if (userData == undefined || userData == null) {
                const user = new userModel();
                user.email = body.email;
                user.setPassword(body.password);
                user.save((error, user) => {
                    (error) ? reject(error) : resolve(user);
                })
            } else {
                reject("User already exists");
            }
        })
    })
}

/**
 * login user 
 * @param {*} usser 
 */
module.exports.loginUser = (user) => {
    return new Promise((resolve, reject) => {
        try {
            userModel.findOne({ email: user.email }, function (err, userData) {
                if (err) {
                    reject(err);
                }
                if (userData != undefined || userData != null) {
                    let status = userData
                        .validPassword(user.password);
                    (status) ?
                        resolve("Login success") :
                        reject("Invalid user name or password");
                } else {
                    reject("Invalid user name or password");
                }
            })
        } catch (error) {
            reject('' + error);
        }
    })
}