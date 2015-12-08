angular.module('j316.translate.service.translation', [])
    .service('TranslationService', function ($q, $rootScope, $interval, $cookies) {

        var registrationInfo = {name: null, lang: 'en'};

        var connection = null;

        var timeout = null;

        var settings = {readingTime: 1};
        this.langList = [
            {key: 'ru', lang: 'Русский'},
            {key: 'en', lang: 'English'},
            {key: 'ar', lang: 'Arabic'},
            {key: 'ph', lang: 'Pharsi'},
            {key: 'hi', lang: 'Hindu'},
            {key: 'tu', lang: 'Türkisch'},
            {key: 'al', lang: 'Albanisch'}];


        /**
         * Returns registration info object
         * @returns {*}
         */
        this.getRegistrationInfo = function () {
            var savedInfo = $cookies.getObject('j316-translation-reg');
            if (savedInfo) {
                registrationInfo = savedInfo;
                return registrationInfo;
            }

            return registrationInfo;
        };

        /**
         * Registers current user
         * @param regInfo
         * @returns {{name: null, lang: string}}
         */
        this.register = function (regInfo) {
            if (!regInfo.name) {
                regInfo.name = 'Anonym'
            }

            $cookies.putObject('j316-translation-reg', regInfo);
            registrationInfo = regInfo;

            return registrationInfo;
        };

        /**
         * Returns current settings
         * @returns {{scrollToBottom: boolean, readingTime: number}}
         */
        this.getSettings = function () {
            var savedInfo = $cookies.getObject('j316-translation-settings');

            if (savedInfo) {
                settings = savedInfo;
                return settings;
            }

            return settings;
        };


        /**
         * Save changed settings
         * @param settingsData
         */
        this.setSettings = function (settingsData) {
            $cookies.putObject('j316-translation-settings', settingsData);
            settings = settingsData;
            $rootScope.$broadcast('settingsUpdated', settingsData);
        };

        /**
         * Send question to the server
         * @param msg
         */
        this.sendQuestion = function (msg) {
            console.info('sending complete ' + msg);
        };
        /**
         * Indicates if client is online
         * @returns {boolean}
         */
        this.isOnline = function () {
            return connection;
        };

        /**
         * Process registration of user
         */
        this.connect = function () {
            var defer = $q.defer();
            connection = true;
            defer.resolve(true);


           timeout = $interval(function () {
                $rootScope.$broadcast('newMsg', {time: new Date(), msg: 'Wow hier kommt was. Das ist ein weiterer Satz.'});
            }, settings.readingTime * 500);


            return defer.promise;
        };

        /**
         * Process registration of user
         */
        this.disconnect = function () {
            connection = false;
            $interval.cancel( timer );
            return connection;
        }


    });