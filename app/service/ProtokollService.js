var async = require('neo-async');
var config = require('../../config/config');
var _ = require('underscore');

/**
 * Webservice to search and provide text search service
 */
var protokollService = function () {

    var controller = {

        /**
         * Method to return Entity of given type with given uuid
         * @param req
         * @param res
         * @param next
         */
        getProtokoll: function (req, res, next) {
            var requestedDate = req.query.date;
            if (!rqBody || !rqBody.query || rqBody.query.length == 0) {
                return res.send("Cannot search for empty string");
            }

            index.search(rqBody.query, function searchDone(err, content) {
                console.log(err, content);
                res.send(content);
            });

        }
    };

    return controller;

};

module.exports = protokollService();