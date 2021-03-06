angular.module('j316.translate.controller.client', [])
    .controller('ClientCtrl', function ($scope, $location, $window, $http, $log, TranslationService, languages) {

        $scope.registrationInfo = TranslationService.getRegistrationInfo();
        $scope.isConnecting = false;

        $scope.isOnline = function () {
            return TranslationService.isOnline()
        };
        
        $scope.$watch('isOnline()', function (newVal) {
            if (newVal) {
                $location.path('/translation');
            }
        });

        $scope.connect = function () {
            $scope.registrationInfo = TranslationService.register($scope.registrationInfo);
            $scope.isConnecting = true;
            TranslationService.connect().then(
                function (result) {
                    $scope.isConnecting = false;
                    $location.path('/translation');
                }
            );
        };

        $scope.langList = languages;
    });