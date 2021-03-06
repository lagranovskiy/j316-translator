angular.module('j316.translate.service.translation', [])
    .service('TranslationService', function ($q, $rootScope, $log, $cookies, translatorSocket) {

        var registrationInfo = {name: null, language: 'de'};

        var sentMessages = [];
        var lastIndex = 0;

        var isOnline = false;


        /**
         * Indicates if client is online
         * @returns {boolean}
         */
        this.isOnline = function () {
            return isOnline;
        };

        this.sendMessage = function (msg) {
            if (!msg || !msg.text || msg.text.length === 0) {
                $log.info('ignoring empty message sending');
                return;
            }
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

        this.getNext = function () {
            if (sentMessages.length > 0 && lastIndex > 0) {
                var retVal = sentMessages[lastIndex % sentMessages.length];
                lastIndex--;
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
                $log.log("There was an error with the authentication:", err);
                defer.reject("There was an error with the authentication:" + err);
                translatorSocket.removeAllListeners('unauthorized');
            });

            translatorSocket.on('singinCompleted', function () {
                $log.info('Registration completed');
                isOnline = true;
                defer.resolve();
                translatorSocket.removeAllListeners('singinCompleted');
            });


            translatorSocket.emit('authentication', {
                senderName: registrationInfo.name,
                senderLanguage: registrationInfo.language,
                accessKey: accessKey,
                time: new Date().getTime()
            });


            return defer.promise;
        };


        $rootScope.$on('alreadyAuthenticated', function (event, data) {
            registrationInfo.name = data.senderName;
            registrationInfo.language = data.senderLanguage;
            isOnline = true;
        });

        /**
         * Requests info about listeners
         */
        this.requestListenersInfo = function () {
            translatorSocket.emit('requestListenersInfo');
        };

        /**
         * Process disconnection of user
         */
        this.disconnect = function () {
            isOnline = false;
            translatorSocket.emit('singout', {});

            $log.info('Leaved translation room');
        };


        /**
         * Returns registration info object
         * @returns {*}
         */
        this.getRegistrationInfo = function () {
            var savedInfo = $cookies.getObject('j316-translation-control-reg');
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

            $cookies.putObject('j316-translation-control-reg', regInfo);
            registrationInfo = regInfo;

            return registrationInfo;
        };


    });