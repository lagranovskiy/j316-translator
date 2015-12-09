'use strict';


angular.module('consumerApp', [
    'ngCookies',
    'ngRoute',
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
        {key: 'ar', lang: 'Arabic'},
        {key: 'ph', lang: 'Pharsi'},
        {key: 'hi', lang: 'Hindu'},
        {key: 'tu', lang: 'Türkisch'},
        {key: 'al', lang: 'Albanisch'}])

    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default');
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