var async = require('neo-async');
var config = require('../../config/config');
var _ = require('underscore');
var moment = require("moment");
var protokollDistributor = require("../business/ProtokollDistributor");
/**
 * Webservice to search and provide text search service
 */
var protokollService = function() {

    var controller = {

        /**
         * Method to return Entity of given type with given uuid
         * @param req
         * @param res
         * @param next
         */
        getProtokoll: function(req, res, next) {
            var requestedDate = req.query.date;
            if (!requestedDate) {
                return res.status(500).send("Cannot get protokoll without date query option. use ?date=2016-02-02 as a paramteter");
            }
            else if (requestedDate === 'today') {
                requestedDate = null;
            }
            else {
                requestedDate = moment(requestedDate, "YYYY-MM-DD");
            }

            protokollDistributor.getDayOriginalProtokoll(requestedDate, function(err, protokoll) {
                if (err) {
                    console.error(err);
                    return res.status(500).send(err);
                }

                return res.send(protokoll);
            });
        },


        /**
         * Distribute 
         * 
         * */
        distributeProtokoll: function(req, res, next) {
            var requestedDate = req.query.date;
            var recipientList = req.query.email;
            if (!recipientList) {
                return res.status(500).send("Cannot get distribute without target email. use ?email=test@test.com,test2@test.com as a paramteter");
            }
            if (!requestedDate) {
                return res.status(500).send("Cannot get distribute without date query option. use ?date=2016-02-02 as a paramteter");
            }
            else if (requestedDate === 'today') {
                requestedDate = null;
            }
            else {
                requestedDate = moment(requestedDate, "YYYY-MM-DD");
            }

            async.waterfall([function(callback) {
                protokollDistributor.distributeProtokoll(requestedDate, recipientList, callback);
            }], function(err, result) {
                if (err) {
                    console.error(err);
                    return res.status(500).send(err);
                }

                res.send(result);
            });

        }
    };

    return controller;

};

module.exports = protokollService();