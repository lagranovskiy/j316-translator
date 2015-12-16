var config = {
    appName: process.env.APPLICATION_NAME || 'J316-Translator',
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 1080,
    accessKey: process.env.ACCESS_KEY || 'j316',
    keys: {
        yandexTranslate: {
            yandex_api_key: process.env.YANDEX_TRANSLATE_KEY || 'trnsl.1.1.20151210T130449Z.f70996eac99dae79.7472735483bf1151faa69f6db559acc1eefd23e4'
        },
        dbt: {
            dbt_url: process.env.DBT_URL || 'http://dbt.io/',
            dbt_key: process.env.DBT_KEY || 'acd4b6500fdb6dac0282252da77408ba'
        }
    },
    init: function () {
        return this;
    }
};

module.exports = config.init();