'use strict';


angular.module('consumerApp', [
    'ngCookies',
    'ngRoute',
    'ngSanitize',
    'angular-underscore',

    'ngMaterial',
    'infinite-scroll',
    'j316.translate.service.translation',

    'j316.translate.controller.nav',
    'j316.translate.controller.translation',
    'j316.translate.controller.client'

])

    .run(['$rootScope', '$location',

        function ($rootScope, $location) {
            $rootScope.$location = $location;


        }
    ])

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