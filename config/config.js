var config = {
    appName: process.env.APPLICATION_NAME || 'J316-Translator',
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 1080,
    accessKey: process.env.ACCESS_KEY || 'j316',
    keys: {
        yandexTranslate: {
            yandex_api_key: process.env.YANDEX_TRANSLATE_KEY || 'dummy'
        },
        dbt: {
            dbt_url: process.env.DBT_URL || 'http://dbt.io/',
            dbt_key: process.env.DBT_KEY || 'dummy'
        }
    },
    init: function () {
        return this;
    }
};

module.exports = config.init();