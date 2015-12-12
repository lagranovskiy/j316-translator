'use strict';


angular.module('consumerApp', [
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

    'j316.translate.controller.nav',
    'j316.translate.controller.translation',
    'j316.translate.controller.client'

])

    .run(['$rootScope', '$location',

        function ($rootScope, $location) {
            $rootScope.$location = $location;


        }
    ])
    .factory('translatorSocket', function (socketFactory, $rootScope, $log) {
        var translatorSocket = socketFactory({
            reconnection: true,
            ioSocket: io.connect(window.location.origin + '/consumer')
        });


        translatorSocket.forward('newQuestionAnswer', $rootScope);
        $rootScope.$on('socket:newQuestionAnswer', function (ev, data) {
            $rootScope.$broadcast('newQuestionAnswer', {
                time: new Date(),
                msg: data
            });
        });

        translatorSocket.forward('newTranslation', $rootScope);
        $rootScope.$on('socket:newTranslation', function (ev, data) {
            $log.debug('Translation msg retrieved: ' + JSON.stringify(data));
            $rootScope.$broadcast('newTranslation', data);
        });

        translatorSocket.forward('cachedTranslations', $rootScope);
        $rootScope.$on('socket:cachedTranslations', function (ev, data) {
            $log.debug('Cached Translation msg retrieved: ' + JSON.stringify(data));
            $rootScope.$broadcast('cachedTranslations', data);
        });

        return translatorSocket;
    })


    .value('languages', [
        {key: 'sq', lang: 'Albanian'},
        {key: 'en', lang: 'English', known: true},
        {key: 'ar', lang: 'Arabic', rtl: true},
        {key: 'hy', lang: 'Armenian'},
        {key: 'az', lang: 'Azerbaijan'},
        {key: 'af', lang: 'Afrikaans'},
        {key: 'bg', lang: 'Bolgarian'},
        {key: 'vi', lang: 'Vietnamese'},
        {key: 'hu', lang: 'Hungarian'},
        {key: 'nl', lang: 'Dutch'},
        {key: 'el', lang: 'Greek'},
        {key: 'ka', lang: 'Georgian'},
        {key: 'da', lang: 'Danish'},
        {key: 'he', lang: 'Hebrew', rtl: true},
        {key: 'it', lang: 'Italian'},
        {key: 'es', lang: 'Spanish'},
        {key: 'ky', lang: 'Kyrgyz'},
        {key: 'zh', lang: 'Chinese'},
        {key: 'ko', lang: 'Korean'},
        {key: 'lv', lang: 'Latvian'},
        {key: 'lt', lang: 'Lithuanian'},
        {key: 'mk', lang: 'Macedonian'},
        {key: 'mn', lang: 'Mongolian'},
        {key: 'no', lang: 'Norwegian'},
        {key: 'fa', lang: 'Persian', rtl: true},
        {key: 'kk', lang: 'Kazakh', rtl: true},
        {key: 'ru', lang: 'Russian', known: true},
        {key: 'de', lang: 'German', known: true},
        {key: 'pl', lang: 'Polish'},
        {key: 'pt', lang: 'Portuguese'},
        {key: 'ro', lang: 'Romanian'},
        {key: 'sr', lang: 'Serbian'},
        {key: 'sk', lang: 'Slovakian'},
        {key: 'sl', lang: 'Slovenian'},
        {key: 'sw', lang: 'Swahili'},
        {key: 'th', lang: 'Thai'},
        {key: 'tl', lang: 'Tagalog'},
        {key: 'tt', lang: 'Tatar'},
        {key: 'tr', lang: 'Turkish'},
        {key: 'uz', lang: 'Uzbek'},
        {key: 'fi', lang: 'Finish'},
        {key: 'fr', lang: 'French'},
        {key: 'hr', lang: 'Croatian'},
        {key: 'cs', lang: 'Czech'},
        {key: 'sv', lang: 'Swedish'},
        {key: 'et', lang: 'Estonian'},
        {key: 'ja', lang: 'Japanese'}
    ])

    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('black')
            .primaryPalette('grey', {
                'default': '900' // by default use shade 900 from the grey palette for primary intentions
            });

        $mdThemingProvider.setDefaultTheme('black');
    })

    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/client.html'
            })
            .when('/translation', {
                templateUrl: 'views/translation.html'
            })
            .otherwise('/');

    });