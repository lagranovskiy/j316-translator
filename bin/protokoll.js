var requestify = require('requestify');
var config = require('./../config/config');
var moment = require("moment");

console.log('Scheduled driven Report call started');

console.log('Calling: ' + config.hostname + '/protokoll/send')
requestify.get(config.hostname + '/protokoll/send', {
    params: {
        email : config.keys.postmark.serviceProtokoll.recipients,
        date: new moment().format('YYYY-MM-DD')
    }
}).then(function(response) {
    console.info('Report result', response.getBody());
    console.log('Scheduled driven Protokoll report call processed');
});;