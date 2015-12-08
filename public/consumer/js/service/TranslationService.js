angular.module('j316.translate.service.translation', [])
    .service('TranslationService', function ($q, $cookies) {

        var registrationInfo = {name: null, lang: 'en'};

        var connection = null;

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

        this.register = function (regInfo) {
            if (!regInfo.name) {
                regInfo.name = 'Anonym'
            }

            $cookies.putObject('j316-translation-reg', regInfo);
            registrationInfo = regInfo;

            return registrationInfo;
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
            return defer.promise;
        };

        /**
         * Process registration of user
         */
        this.disconnect = function () {
            connection = false;
            return connection;
        }


    });