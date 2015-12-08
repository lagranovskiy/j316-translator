angular.module('j316.translate.controller.translation', ['angular-underscore'])
    .controller('TranslationCtrl', function ($scope, $location, $window, $http, $log, TranslationService) {

        $scope.isOnline = function () {
            return TranslationService.isOnline()
        };
        $scope.$watch('isOnline()', function (newVal, oldVal) {
            if (!newVal) {
                $location.path('/');
            }
        });

        $scope.clientInfo = TranslationService.getRegistrationInfo();

        $scope.localizeLang = function (key) {
            return _.findWhere(TranslationService.langList, {key: key});
        }

    });