bcvMap = {
    ru: require("bible-passage-reference-parser/js/ru_bcv_parser").bcv_parser,
    en: require("bible-passage-reference-parser/js/en_bcv_parser").bcv_parser,
    de: require("bible-passage-reference-parser/js/de_bcv_parser").bcv_parser
};

var parseSettings = {
    invalid_passage_strategy: 'include',
    invalid_sequence_strategy: 'ignore',
    book_alone_strategy: 'first_chapter',
    consecutive_combination_strategy: 'separate',
    osis_compaction_strategy: 'bc',
    versification_system: 'nab',
    punctuation_strategy: 'eu'
};

var referenceParser = {


    /**
     * Parses the given parse text to get standartized lookup osis object
     * @param language language of zitat
     * @param parseText zitat
     * @param callback callback
     */
    parseOSIS: function (language, parseText, callback) {
        if (!language) {
            return callback('No language set.');
        }

        if (!parseText) {
            return callback('No parseText set.');
        }

        var parser = new bcvMap[language];
        parser.set_options(parseSettings);

        var result = parser.parse(parseText);
        var osis = result.osis();
        var parsedEntities = result.parsed_entities();
        callback(null, parsedEntities, osis);

    },

    /**
     * Returns meta info about given book
     * @param language
     * @param bookId
     * @param callback
     * @returns {*}
     */
    getMetaInfo: function (language, callback) {
        var parser = new bcvMap[language];
        parser.set_options(parseSettings);
        var info = parser.translation_info('nab');
        if (callback) {
            return callback(info);
        }
        return info;
    }
};

module.exports = referenceParser;