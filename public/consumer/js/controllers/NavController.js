angular.module('j316.translate.controller.nav', [])
    .controller('NavCtrl', function ($scope, TranslationService) {

        $scope.isOnline = function () {
            return TranslationService.isOnline();
        };

        $scope.disconnect = function () {
            TranslationService.disconnect();
        };
    });