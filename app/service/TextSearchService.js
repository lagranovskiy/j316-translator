var async = require('neo-async');
var langMap = require('../../config/langMap');
var config = require('../../config/config');
var _ = require('underscore');

var algoliasearch = require('algoliasearch');


/**
 * Webservice to search and provide text search service
 */
var textSearchService = function () {

    var client = algoliasearch(config.keys.algolia.applicationId, config.keys.algolia.apiKey);

    var controller = {

        /**
         * Method to return Entity of given type with given uuid
         * @param req
         * @param res
         * @param next
         */
        searchText: function (req, res, next) {
            var query = req.body;

            if(!query || query.length() == 0){
                console.error("Cannot search for empty string");
                return res.send("Cannot search for empty string");
            }

            var index = client.initIndex(config.keys.algolia.indexName);
            index.search(query, function searchDone(err, content) {
                console.log(err, content);
                res.send(content);
            });

        }
    };

    return controller;

};

module.exports = textSearchService();