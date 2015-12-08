angular.module('j316.translate.controller.translation', ['angular-underscore'])
    .controller('TranslationCtrl', function ($scope, $anchorScroll, $location, $timeout, $window, $http, $log, TranslationService) {

        $scope.showLastMsgCount = 20;
        $scope.messages = [];

        $scope.isOnline = function () {
            return TranslationService.isOnline()
        };

        $scope.$watch('isOnline()', function (newVal) {
            if (!newVal) {
                $location.path('/');
            }
        });


        $scope.$on('newMsg', function (event, msg) {
            $scope.messages.unshift(msg);
            if ($scope.messages.length > 300) {
                $scope.messages.pop();
            }

        });

        $scope.incShowedMsgs = function(){
            $scope.showLastMsgCount =  $scope.showLastMsgCount+5;
        };


        $scope.clientInfo = TranslationService.getRegistrationInfo();

        $scope.localizeLang = function (key) {
            return _.findWhere(TranslationService.langList, {key: key});
        }

    });