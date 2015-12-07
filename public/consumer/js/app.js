'use strict';


angular.module('consumerApp', [
    'ngCookies',
    'ngRoute',
    'ngSanitize',

    'j316.translate.controller.consumer'
])

    .run(['$rootScope', '$location',

        function ($rootScope, $location) {
            $rootScope.$location = $location;



        }
    ])

    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/consuming.html',
                controller: 'ConsumerCtrl',
                requireLogin: true
            })
    });