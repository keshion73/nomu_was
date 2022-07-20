

var config = require('../../rest_nomu/env/all.js')

let cookie = {
  autoLoginKey: 'autoLogin',
  uidKey: 'uid',
  nomuSessionId: 'nomu_sid'
}

module.exports = {
    'cookie': cookie,
    'jwt': config.jwt
}