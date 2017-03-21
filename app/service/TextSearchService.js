var async = require('neo-async');
var langMap = require('../../config/langMap');
var config = require('../../config/config');
var _ = require('underscore');

var algoliasearch = require('algoliasearch');


/**
 * Webservice to search and provide text search service
 */
var textSearchService = function () {
    controle.log('search: '+config.keys.algolia.applicationId + ' ' +  config.keys.algolia.apiKey);
    var client = algoliasearch(config.keys.algolia.applicationId, config.keys.algolia.apiKey);
    var index = client.initIndex(config.keys.algolia.indexName);
    index.setSettings({
        'ranking': ['desc(title)']
    }, function (err, content) {
        console.log(content);
    });

    var controller = {

        /**
         * Method to return Entity of given type with given uuid
         * @param req
         * @param res
         * @param next
         */
        searchText: function (req, res, next) {
            var rqBody = req.body;
            if (!rqBody || !rqBody.query || rqBody.query.length == 0) {
                return res.send("Cannot search for empty string");
            }

            console.log('Searching for ' + rqBody.query);
            index.search(rqBody.query, function searchDone(err, content) {
                console.log(err, content);
                res.send(content);
            });

        }
    };

    return controller;

};

module.exports = textSearchService();