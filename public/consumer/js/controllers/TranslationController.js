angular.module('j316.translate.controller.translation', ['angular-underscore'])
    .controller('TranslationCtrl', function ($scope, $anchorScroll, $location, $timeout, $window, $http, $log, TranslationService, languages) {

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



        $scope.$on('newTranslation', function (event, msg) {
            var displayableMessage = {
                translation: msg.translation,
                sourceName: msg.sourceName,
                sourceLanguage: msg.sourceLanguage,
                timestamp: msg.timestamp,
                type: 'message'
            };

            $scope.messages.unshift(displayableMessage);
            if ($scope.messages.length > 300) {
                $scope.messages.pop();
            }
        });

        $scope.$on('cachedTranslations', function (event, msg) {
            _.each(msg, function(singleMsg){
                var displayableMessage = {
                    translation: singleMsg.translation,
                    sourceName: singleMsg.sourceName,
                    sourceLanguage: singleMsg.sourceLanguage,
                    timestamp: singleMsg.timestamp,
                    type: 'message'
                };


                $scope.messages.unshift(displayableMessage);
                if ($scope.messages.length > 300) {
                    $scope.messages.pop();
                }
            });
        });



        $scope.formatDate = function (timestamp) {
            return new Date(timestamp).getHours() + ':' + new Date(timestamp).getMinutes();
        };

        $scope.incShowedMsgs = function () {
            $scope.showLastMsgCount = $scope.showLastMsgCount + 5;
        };


        $scope.clientInfo = TranslationService.getRegistrationInfo();

        $scope.localizeLang = function (key) {
            return _.findWhere(languages, {key: key});
        }

    });