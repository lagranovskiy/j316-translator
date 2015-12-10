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

    'j316.translate.controller.nav',
    'j316.translate.controller.translation',
    'j316.translate.controller.sender'

])

    .run(['$rootScope', '$location',

        function ($rootScope, $location) {
            $rootScope.$location = $location;


        }
    ])
    .factory('translatorSocket', function (socketFactory) {
        var mySocket = socketFactory();
        return mySocket;
    })

    .factory('questionSocket', function (socketFactory) {
        var questionSocket = socketFactory(
            {
                prefix: 'questions~',
                ioSocket: io.connect(window.location.origin + '/questions')
            }
        );
        return questionSocket;
    })
    .value('languages', [
        {key: 'ru', lang: 'Русский'},
        {key: 'en', lang: 'English'},
        {key: 'de', lang: 'Deutsch'}
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
                templateUrl: 'views/sender.html'
            })
            .when('/translationPanel', {
                templateUrl: 'views/translationPanel.html'
            })
            .otherwise('/');

    });