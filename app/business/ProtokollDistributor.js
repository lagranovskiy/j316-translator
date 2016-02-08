var async = require('neo-async');
var _ = require('underscore');
var NodeCache = require("node-cache");
var serviceDistributor = require('./ServiceDistributor');
var util = require('util');
var moment = require('moment');


/**
 * Service distributor provides the connection between business logic and clients communication
 */
var protocolService = function () {

    var cache = new NodeCache({stdTTL: 60 * 60 * 18, checkperiod: 60 * 60 * 3});


    /**
     * {
            timestamp: new Date().getTime,
            text: text,
            sourceLanguage: sourceLanguage,
            translationSource: translationSource
        }
     */
    serviceDistributor.on('newText', function (protocolEntry) {
        var dayKey = moment().format('L');
        var dayArray = cache.get(dayKey);
        if (!dayArray) {
            dayArray = [];
        }
        dayArray.push(protocolEntry);
        cache.set(dayKey, dayArray, function (err, success) {
                if (!err && success) {
                    console.log('Protokoll: Entry saved');
                } else {
                    console.error('Protokoll: Entry not saved:' + err);
                }
            }
        );
    });


    var protocolDistributor = {

        /**
         * Returns array of texts from saved protokoll
         *
         * @param protokollDate
         */
        getDayOriginalProtokoll: function (protokollDate, callback) {
            if (!protokollDate) {
                protokollDate = new Date();
            }

            var dayKey = moment(protokollDate).format('L');
            var dayProtokoll = cache.get(dayKey);

            if (!dayProtokoll) {
                return callback('No Protokoll entries for date: ' + dayKey);
            }

            return callback(null, dayProtokoll);
        }
    };

    return protocolDistributor;

};
module.exports = protocolService();