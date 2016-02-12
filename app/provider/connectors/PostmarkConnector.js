var config = require('../../../config/config');
var _ = require('underscore');
var postmark = require("postmark");
var async = require('neo-async');

/**
 * DBT Connector API
 *
 */
var postmarkConnector = function() {

    var client = new postmark.Client(config.keys.postmark.apiToken);

    var service = {

        /**
         * Send a templated message
         * 
         * @param recipientsArray  list of recipients
         * @param templateId template id
         * @param messageObject object with template params
         * @param callback callabck
         * */
        sendTemplatedMessage: function(recipientsArray, templateId, messageObject, callback) {


            // Validate that we have all we need
            if (!recipientsArray) {
                return callback('No Recipients - No notification');
            }
            if (!templateId) {
                return callback('No template for the message defined');
            }
            if (!messageObject) {
                return callback('No message- No notification');
            }


            async.waterfall([function(asyncCallback) {
                // See doku http://developer.postmarkapp.com/developer-api-templates.html#email-with-template
                console.info('Sending email to ' + recipientsArray);
                client.sendEmailWithTemplate({
                    From: config.keys.postmark.senderEmail,
                    To: recipientsArray,
                    TemplateId: templateId,
                    TemplateModel: messageObject
                }, asyncCallback);

            }], function(error, result) {
                if (error) {
                    console.error("Unable to send via postmark: " + error.message);
                    return callback(error);
                }
                return callback(null, result);
            });

        }
    };

    return service;
};

module.exports = postmarkConnector();