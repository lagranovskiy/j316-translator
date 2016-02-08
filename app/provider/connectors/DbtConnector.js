var config = require('../../../config/config');
var _ = require('underscore');
var http = require('http');
var querystring = require('querystring');

/**
 * DBT Connector API
 *
 */
var dbtConnector = function () {

    var service = {
        /**
         * Returns vers with given parameters fetched from dbt.io
         * @param damId dam id from langMap
         * @param bookId book name like Ps
         * @param chapterId chapter nr (optional)
         * @param verseStart start vers nr (optional)
         * @param verse_end end vers nr (optional)
         * @param callback callback
         * @returns {*}
         */
        getVersInLang: function (damId, bookId, chapterId, verseStart, verse_end, callback) {
            if (!damId) {
                console.info('dbtConnector :: no damID given.');
                return callback('Unknown translation');
            }
            if (!bookId) {
                console.info('dbtConnector :: no bookId given.');
                return callback('Unknown book');
            }
            var paramMap = {
                key: config.keys.dbt.dbt_key,
                dam_id: damId,
                book_id: bookId,
                v: 2
            };

            if (chapterId) {
                paramMap.chapter_id = chapterId
            }

            if (verseStart) {
                paramMap.verse_start = verseStart;
                paramMap.verse_end = verseStart
            }

            if (verse_end) {
                paramMap.verse_end = verse_end
            }


            var url = config.keys.dbt.dbt_url + 'text/verse?' + querystring.stringify(paramMap);
            console.info('Requesting: ' + url);
            var body = '';
            http.get(url, function (res) {
                res.on('data', function (chunk) {
                    body += chunk;
                });
                res.on('end', function () {
                    try {
                        console.info('Response from DBT: ' + body);
                        var fbResponse = JSON.parse(body);
                        _.each(fbResponse, function (vers) {
                            vers.verse_text = vers.verse_text.trim()
                        });
                        return callback(null, fbResponse);
                    }
                    catch (err) {
                        return callback(err);
                    }

                });
            }).on('error', function (e) {
                console.error("Got error: " + e.message);
                callback("DBT :: Got error: " + e.message);
            });
        }
    };

    return service;
};

module.exports = dbtConnector();