angular.module('j316.translate.service.translation', [])
    .service('TranslationService', function ($q, $rootScope, $cookies, translatorSocket) {

        var registrationInfo = {name: null, language: 'de'};

        var sentMessages = [];
        var lastIndex = 0;

        var isOnline = false;

        var settings = {};

        /**
         * Socket communication
         */

        translatorSocket.forward('newTranslation', $rootScope);
        $rootScope.$on('socket:newTranslation', function (ev, data) {
            console.debug('Translation msg retrieved: ' + JSON.stringify(data));
            $rootScope.$broadcast('newTranslation', data);
        });

        translatorSocket.forward('cachedTranslations', $rootScope);
        $rootScope.$on('socket:cachedTranslations', function (ev, data) {
            console.debug('Cached Translation msg retrieved: ' + JSON.stringify(data));
            $rootScope.$broadcast('cachedTranslations', data);
        });

        /**
         * Indicates if client is online
         * @returns {boolean}
         */
        this.isOnline = function () {
            return isOnline;
        };

        this.sendMessage = function (msg) {
            translatorSocket.emit('newMessage', msg);
            sentMessages.unshift(msg.text);
            lastIndex = 0;
            if (sentMessages.length > 30) {
                sentMessages.pop();
            }
        };

        this.getLast = function () {
            if (sentMessages.length > 0) {
                var retVal = sentMessages[lastIndex % sentMessages.length];
                lastIndex++;
                return retVal;
            }
            return null;
        };

        /**
         * Process registration of user
         */
        this.connect = function (accessKey) {
            var defer = $q.defer();

            translatorSocket.on('unauthorized', function (err) {
                console.log("There was an error with the authentication:", err.message);
                defer.reject("There was an error with the authentication:" + err.message);
                translatorSocket.removeAllListeners('unauthorized');
            });

            translatorSocket.on('singinCompleted', function () {
                console.info('Registration completed');
                isOnline = true;
                defer.resolve();
                translatorSocket.removeAllListeners('singinCompleted');
            });

            translatorSocket.emit('authentication', {
                sender: registrationInfo,
                accessKey: accessKey,
                time: new Date().getTime()
            });


            return defer.promise;
        };


        /**
         * Process disconnection of user
         */
        this.disconnect = function () {
            isOnline = false;
            translatorSocket.emit('singout', {});
            translatorSocket.removeAllListeners('newTranslation');

            console.info('Leaved translation roam');
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