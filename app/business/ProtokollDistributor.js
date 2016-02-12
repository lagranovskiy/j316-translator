var async = require('neo-async');
var _ = require('underscore');
var NodeCache = require("node-cache");
var serviceDistributor = require('./ServiceDistributor');
var util = require('util');
var moment = require('moment');
var postmarkConnector = require("../provider/connectors/PostmarkConnector");
var config = require('../../config/config');


/**
 * Service distributor provides the connection between business logic and clients communication
 */
var protocolService = function() {

    var cache = new NodeCache({
        stdTTL: 60 * 60 * 18,
        checkperiod: 60 * 60 * 3
    });


    /**
     * {
            timestamp: new Date().getTime,
            text: text,
            sourceLanguage: sourceLanguage,
            translationSource: translationSource
        }
     */
    serviceDistributor.on('newText', function(protocolEntry) {
        var dayKey = moment().format('L');
        var dayArray = cache.get(dayKey);
        if (!dayArray) {
            dayArray = [];
        }
        dayArray.push(protocolEntry);
        cache.set(dayKey, dayArray, function(err, success) {
            if (!err && success) {
                console.log('Protokoll: Entry saved');
            }
            else {
                console.error('Protokoll: Entry not saved:' + err);
            }
        });
    });


    var protocolDistributor = {

        /**
         * Returns array of texts from saved protokoll
         *
         * @param protokollDate
         */
        getDayOriginalProtokoll: function(protokollDate, callback) {
            if (!protokollDate) {
                protokollDate = new Date();
            }

            var dayKey = moment(protokollDate).format('L');
            var dayProtokoll = cache.get(dayKey);

            if (!dayProtokoll) {
                return callback('No Protokoll entries for date: ' + dayKey);
            }

            return callback(null, dayProtokoll);
        },

        /**
         * Distributes protokoll to given date to given recipients
         * 
         * @param protokollDate date of protokoll to be sent
         * @param recipientList comma separated list of recipients to be processed
         * @callback callback to be called after process
         * */
        distributeProtokoll: function(protokollDate, recipientList, callback) {

            async.waterfall([function(asyncCallback) {

                // Get protokoll internally
                protocolDistributor.getDayOriginalProtokoll(protokollDate, asyncCallback);

            }, function(protokoll, asyncCallback) {
                // test if protokoll is big enought to be sent
                if (!protokoll || protokoll.length < 1) {
                    return callback('There are not enouth messages in protokoll to be distributed');
                }

                var templateId = config.keys.postmark.serviceProtokoll.templateId * 1;

                var messageObject = {
                    serviceDay: moment().format('MMMM Do YYYY'),
                    servicePlace: config.info.appBrand,
                    serviceProtokoll: [],
                    protokollSize: protokoll.length
                }

                var lastMsgTime = null;
                _.each(protokoll, function(protokollEntry) {

                    var entryTime = moment(protokollEntry.timestamp)
                    var timePeriod = '';
                    if (lastMsgTime) {
                        timePeriod = ' \n (' + moment(lastMsgTime).from(entryTime) + ') '
                    }
                    lastMsgTime = protokollEntry.timestamp;

                    var entry = {
                        text: protokollEntry.text,
                        time: moment(protokollEntry.timestamp).format('hh:mm') +  timePeriod ,
                        sender: protokollEntry.translationSource
                    }

                    messageObject.serviceProtokoll.push(entry);
                })

                postmarkConnector.sendTemplatedMessage(recipientList, templateId, messageObject, asyncCallback);
            }], function(err, result) {
                if (err) {
                    return callback('Cannot proccess protokoll distribution because of: ' + err);
                }
                callback(result);
            });


        }
    };

    return protocolDistributor;

};
module.exports = protocolService();