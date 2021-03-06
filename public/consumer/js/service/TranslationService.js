angular.module('j316.translate.service.translation', [])
    .service('TranslationService', function ($q, $rootScope, $interval, $cookies, translatorSocket) {

        var registrationInfo = {name: null, lang: 'en'};

        var isOnline = false;

        var settings = {readingTime: 1};


        /**
         * Indicates if client is online
         * @returns {boolean}
         */
        this.isOnline = function () {
            return isOnline;
        };


        /**
         * Process registration of user
         */
        this.connect = function () {
            var defer = $q.defer();

            translatorSocket.on('singinCompleted', function () {
                console.info('Registration completed');
                isOnline = true;
                defer.resolve();
                translatorSocket.removeAllListeners('singinCompleted');
            });


            translatorSocket.emit('singin', {
                clientName: registrationInfo.name,
                clientLanguage: registrationInfo.lang,
                clientTime: new Date()
            });


            return defer.promise;
        };

        $rootScope.$on('alreadyAuthenticated', function (event, data) {
            registrationInfo.name = data.clientName;
            registrationInfo.lang = data.clientLanguage;
            isOnline = true;
        });


        /**
         * Process disconnection of user
         */
        this.disconnect = function () {
            isOnline = false;
            translatorSocket.emit('singout', {});

            console.info('Leaved translation room');
        };


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
        this.saveSettings = function (settingsData) {
            $cookies.putObject('j316-translation-settings', settingsData);
            settings = settingsData;
            $rootScope.$broadcast('settingsUpdated', settingsData);
        };


    });