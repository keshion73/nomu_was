

var config = require('../../rest_nomu/env/production.js')

let server = {
    port: 443,   // ssl아닐 때.

    limit_json: '50mb',
    limit_url: '50mb'
}

let path = config.path
path.was = config.host + ':' + server.port + '/'

module.exports = {
    'server': server,
    'domain': config.domain,
    'host': config.host,
    'path': path
}