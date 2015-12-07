var config = {
    host: process.env.HOST || 'localhost',
    consumer: {
        port: process.env.CONSUMER_PORT || 1080
    },
    sender: {
        port: process.env.SENDER_PORT || 1081
    },
    keys: {
        yandexTranslate: {
            yandex_api_url: process.env.YANDEX_TRANSLATE_URL || 'http://translate.yandex.ru',
            yandex_api_key: process.env.YANDEX_TRANSLATE_KEY || 'Test'
        }
    },
    init: function () {
        return this;
    }
};

module.exports = config.init();