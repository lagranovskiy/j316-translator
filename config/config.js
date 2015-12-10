var config = {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 1080,
    consumer: {},
    sender: {
        port: process.env.SENDER_PORT || 1081,
        accessKey: process.env.ACCESS_KEY || 'j316'
    },
    keys: {
        yandexTranslate: {
            yandex_api_key: process.env.YANDEX_TRANSLATE_KEY || 'trnsl.1.1.20151210T130449Z.f70996eac99dae79.7472735483bf1151faa69f6db559acc1eefd23e4'
        }
    },
    init: function () {
        return this;
    }
};

module.exports = config.init();