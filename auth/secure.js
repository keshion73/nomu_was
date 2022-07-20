


let config = require('../../rest_nomu/config.env')
let secure = require('../../rest_nomu/auth/secure.js')

module.exports = secure(config)