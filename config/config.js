var config = {
    appName: process.env.APPLICATION_NAME || 'J316-Translator',
    info: {
        // Will be communicated to the client after connection
        appBrand: process.env.APPLICATION_BRAND || 'Gemeinde Teststadt',
        brandContact: process.env.BRAND_CONTACT || 'Max Mustermann (0176 123 45 56)'
    },
    // Max time in Minutes as a client may wait for a sender (min)
    maxWaitingTime: process.env.MAX_IDLE_TIME || '30',
    // Time after all client are forced to logout after translation activity closed (min)
    inactiveTimeout: process.env.MAX_INACTIVE_TIME || '30',

    sessionSecret: process.env.SESSION_SECRET || 'mysecret',
    clusterMode: process.env.CLUSTER_MODE || 'false',
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 1080,
    accessKey: process.env.ACCESS_KEY || 'j316',
    redis: process.env.REDIS_URL || 'redis://192.168.99.100:32770',
    keys: {
        newrelic: process.env.NEWRELIC_KEY || 'test',
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