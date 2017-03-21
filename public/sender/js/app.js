'use strict';


angular.module('senderApp', [
    'ngCookies',
    'ngRoute',
    'ngAnimate',
    'ngSanitize',
    'angular-underscore',

    'ngMaterial',
    'btford.socket-io',
    'infinite-scroll',
    'j316.translate.service.translation',
    'j316.translate.service.question',
    'j316.translate.service.info',

    'j316.translate.controller.nav',
    'j316.translate.controller.translation',
    'j316.translate.controller.sender',
    'j316.translate.controller.textsearch'

])

.run(['$rootScope', '$location',

        function($rootScope, $location) {
            $rootScope.$location = $location;

            _.mixin({
                capitalize: function(string) {
                    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
                }
            });
        }
    ])
    .factory('translatorSocket', function(socketFactory, $rootScope, $log) {

        var connection = io.connect(window.location.origin + '/sender', {
            reconnection: true,
            transports: [ 'polling','websocket', 'xhr-polling'],
            reconnectionAttempts: 100
        });

        var translatorSocket = socketFactory({
            ioSocket: connection
        });

        translatorSocket.forward('error');
        $rootScope.$on('socket:error', function(ev, data) {
            $log.error('Error: ' + JSON.stringify(data));
            $rootScope.$broadcast('error', data);
        });

        translatorSocket.forward('info', $rootScope);
        $rootScope.$on('socket:info', function(ev, data) {
            $log.debug('Info msg retrieved: ' + JSON.stringify(data));
            $rootScope.$broadcast('info', data);
        });

        translatorSocket.forward('alreadyAuthenticated', $rootScope);
        $rootScope.$on('socket:alreadyAuthenticated', function(ev, data) {
            $log.debug('Sender already authenticated.');
            $rootScope.$broadcast('alreadyAuthenticated', data);
        });

        translatorSocket.forward('authenticate', $rootScope);
        $rootScope.$on('socket:authenticate', function(ev, data) {
            $log.debug('Auth request received.');
            $rootScope.$broadcast('authenticate', data);
        });

        translatorSocket.forward('listenersChanged', $rootScope);
        $rootScope.$on('socket:listenersChanged', function(ev, data) {
            $log.debug('Listeners change detected: ' + JSON.stringify(data));
            $rootScope.$broadcast('listenersChanged', data);
        });

        translatorSocket.forward('newQuestion', $rootScope);
        $rootScope.$on('socket:newQuestion', function(ev, data) {
            $log.debug('Question msg retrieved: ' + JSON.stringify(data));
            $rootScope.$broadcast('newQuestion', data);
        });

        translatorSocket.forward('answerAck', $rootScope);
        $rootScope.$on('socket:answerAck', function(ev, data) {
            $log.debug('answerAck msg received: ' + JSON.stringify(data));
            $rootScope.$broadcast('answerAck', data);
        });


        translatorSocket.forward('newTranslation', $rootScope);
        $rootScope.$on('socket:newTranslation', function(ev, data) {
            $log.debug('Translation msg retrieved: ' + JSON.stringify(data));
            $rootScope.$broadcast('newTranslation', data);
        });

        translatorSocket.forward('cachedTranslations', $rootScope);
        $rootScope.$on('socket:cachedTranslations', function(ev, data) {
            $log.debug('Cached Translation msg retrieved: ' + JSON.stringify(data));
            $rootScope.$broadcast('cachedTranslations', data);
        });

        translatorSocket.forward('cachedQuestions', $rootScope);
        $rootScope.$on('socket:cachedQuestions', function(ev, data) {
            $log.debug('Cached Question msgs retrieved: ' + JSON.stringify(data));
            $rootScope.$broadcast('cachedQuestions', data);
        });


        return translatorSocket;
    })


.value('languages', [{
    key: 'sq',
    lang: 'Albanian'
}, {
    key: 'de',
    lang: 'German',
    known: true,
    voicelang: 'de-DE'
}, {
    key: 'ru',
    lang: 'Russian',
    known: true,
    voicelang: 'ru-RU'
}, {
    key: 'en',
    lang: 'English',
    known: true,
    voicelang: 'en-GB'
}, {
    key: 'ar',
    lang: 'Arabic',
    rtl: true
}, {
    key: 'hy',
    lang: 'Armenian'
}, {
    key: 'az',
    lang: 'Azerbaijan'
}, {
    key: 'af',
    lang: 'Afrikaans'
}, {
    key: 'bg',
    lang: 'Bolgarian'
}, {
    key: 'vi',
    lang: 'Vietnamese'
}, {
    key: 'hu',
    lang: 'Hungarian'
}, {
    key: 'nl',
    lang: 'Dutch'
}, {
    key: 'el',
    lang: 'Greek'
}, {
    key: 'ka',
    lang: 'Georgian'
}, {
    key: 'da',
    lang: 'Danish'
}, {
    key: 'he',
    lang: 'Hebrew',
    rtl: true
}, {
    key: 'it',
    lang: 'Italian'
}, {
    key: 'es',
    lang: 'Spanish'
}, {
    key: 'ky',
    lang: 'Kyrgyz'
}, {
    key: 'zh',
    lang: 'Chinese'
}, {
    key: 'ko',
    lang: 'Korean'
}, {
    key: 'lv',
    lang: 'Latvian'
}, {
    key: 'lt',
    lang: 'Lithuanian'
}, {
    key: 'mk',
    lang: 'Macedonian'
}, {
    key: 'mn',
    lang: 'Mongolian'
}, {
    key: 'no',
    lang: 'Norwegian'
}, {
    key: 'fa',
    lang: 'Persian',
    rtl: true
}, {
    key: 'kk',
    lang: 'Kazakh',
    rtl: true
}, {
    key: 'pl',
    lang: 'Polish'
}, {
    key: 'pt',
    lang: 'Portuguese'
}, {
    key: 'ro',
    lang: 'Romanian'
}, {
    key: 'sr',
    lang: 'Serbian'
}, {
    key: 'sk',
    lang: 'Slovakian'
}, {
    key: 'sl',
    lang: 'Slovenian'
}, {
    key: 'sw',
    lang: 'Swahili'
}, {
    key: 'th',
    lang: 'Thai'
}, {
    key: 'tl',
    lang: 'Tagalog'
}, {
    key: 'tt',
    lang: 'Tatar'
}, {
    key: 'tr',
    lang: 'Turkish'
}, {
    key: 'uz',
    lang: 'Uzbek'
}, {
    key: 'fi',
    lang: 'Finish'
}, {
    key: 'fr',
    lang: 'French'
}, {
    key: 'hr',
    lang: 'Croatian'
}, {
    key: 'cs',
    lang: 'Czech'
}, {
    key: 'sv',
    lang: 'Swedish'
}, {
    key: 'et',
    lang: 'Estonian'
}, {
    key: 'ja',
    lang: 'Japanese'
}, {
    key: 'be',
    lang: 'Belarusian'
}, {
    key: 'uk',
    lang: 'Ukrainian'
}, {
    key: 'ur',
    lang: 'Urdu'
}])


.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('black')
        .primaryPalette('grey', {
            'default': '900' // by default use shade 900 from the grey palette for primary intentions
        });

    $mdThemingProvider.setDefaultTheme('black');
})


.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/sender.html'
        })
        .when('/translationPanel', {
            templateUrl: 'views/translationPanel.html'
        })
        .otherwise('/');

});